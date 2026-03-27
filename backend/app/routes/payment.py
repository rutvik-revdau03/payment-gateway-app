import os
import razorpay
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

from app.database import SessionLocal
from app.models import Transaction
from app.services.currency import convert_usd_to_inr, get_live_usd_to_inr
from app.services.qr import generate_qr

# Load environment variables from .env
load_dotenv()

router = APIRouter()

# ─── Initialize Razorpay Client ───────────────────────────────────────────────
# Reads RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from your .env file
client = razorpay.Client(auth=(
    os.getenv("RAZORPAY_KEY_ID"),
    os.getenv("RAZORPAY_KEY_SECRET")
))


# ─── Request / Response Models ────────────────────────────────────────────────

class OrderRequest(BaseModel):
    """Data sent by Angular to create a Razorpay order"""
    product: str       # Product name e.g. "Laptop"
    price: float       # Price in USD e.g. 10.00
    quantity: int      # Number of units e.g. 2
    method: str        # Payment method e.g. "upi", "card"


class VerifyRequest(BaseModel):
    """Data sent by Angular after user completes payment in Razorpay popup"""
    razorpay_order_id: str    # Order ID returned by Razorpay
    razorpay_payment_id: str  # Payment ID returned by Razorpay after payment
    razorpay_signature: str   # Signature to verify payment authenticity
    product: str              # Product name (passed along for DB storage)
    quantity: int             # Quantity (passed along for DB storage)
    amount_usd: float         # USD amount (from create-order step)
    amount_inr: float         # INR amount (from create-order step)
    exchange_rate: float      # Live rate used (from create-order step)
    method: str               # Payment method


# ─── ENDPOINT 1: Get Live Exchange Rate ───────────────────────────────────────
@router.get("/exchange-rate")
def get_exchange_rate():
    """
    Returns the current live USD to INR exchange rate.
    Angular can call this to display the live rate on the payment page.

    GET /exchange-rate
    Response: { "base": "USD", "target": "INR", "rate": 84.25, "message": "..." }
    """
    try:
        rate = get_live_usd_to_inr()
        return {
            "base": "USD",
            "target": "INR",
            "rate": rate,
            "message": f"1 USD = ₹{rate}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch rate: {str(e)}")


# ─── ENDPOINT 2: Create Razorpay Order ───────────────────────────────────────
@router.post("/payment/create-order")
def create_order(data: OrderRequest):
    """
    Step 1 of payment flow.
    - Converts USD to INR using the live Frankfurter exchange rate
    - Creates a Razorpay order with the INR amount
    - Returns order details to Angular to open the Razorpay payment popup

    POST /payment/create-order
    Body: { product, price, quantity, method }
    Response: { order_id, amount, currency, key, usd, inr, rate }
    """
    try:
        # Convert USD total to INR using live rate from Frankfurter API
        total_usd = round(data.price * data.quantity, 2)
        conversion = convert_usd_to_inr(total_usd)

        total_inr = conversion["amount_inr"]
        live_rate = conversion["rate"]

        # Razorpay requires amount in PAISE (₹1 = 100 paise)
        # e.g. ₹1665.16 → 166516 paise
        amount_paise = int(total_inr * 100)

        # Create the order on Razorpay's server
        order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": f"receipt_{data.product}_{data.quantity}",
            "notes": {
                "product": data.product,
                "quantity": str(data.quantity),
                "usd_amount": str(total_usd),
                "exchange_rate": str(live_rate)
            }
        })

        print(f"[Payment] Order created: {order['id']} | ₹{total_inr} (rate: {live_rate})")

        return {
            "order_id":  order["id"],              # Used by Angular to open Razorpay popup
            "amount":    amount_paise,             # In paise for Razorpay
            "currency":  "INR",
            "key":       os.getenv("RAZORPAY_KEY_ID"),  # Public key for Angular
            "usd":       total_usd,                # For display purposes
            "inr":       total_inr,                # For display purposes
            "rate":      live_rate                 # Live rate used
        }

    except Exception as e:
        print(f"[Payment] Order creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Order creation failed: {str(e)}")


# ─── ENDPOINT 3: Verify Payment & Save to DB ─────────────────────────────────
@router.post("/payment/verify")
def verify_payment(data: VerifyRequest):
    """
    Step 2 of payment flow.
    - Verifies the Razorpay payment signature (prevents fraud)
    - Saves the verified transaction to the MySQL database
    - Generates a QR code for the payment receipt
    - Returns success status and QR code URL to Angular

    POST /payment/verify
    Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature,
            product, quantity, amount_usd, amount_inr, exchange_rate, method }
    Response: { status, payment_id, qr, message }
    """
    try:
        # ── Verify Razorpay Signature ──────────────────────────────
        # This is critical — it confirms the payment is genuine and not tampered
        # Razorpay generates a signature using HMAC-SHA256
        # If the signature doesn't match, the payment is fraudulent
        client.utility.verify_payment_signature({
            "razorpay_order_id":   data.razorpay_order_id,
            "razorpay_payment_id": data.razorpay_payment_id,
            "razorpay_signature":  data.razorpay_signature
        })
        print(f"[Payment] Signature verified for: {data.razorpay_payment_id}")

    except Exception:
        print(f"[Payment] Signature verification failed for order: {data.razorpay_order_id}")
        raise HTTPException(status_code=400, detail="Payment verification failed. Possible fraud attempt.")

    try:
        # ── Save Transaction to Database ───────────────────────────
        db = SessionLocal()

        txn = Transaction(
            product_name        = data.product,
            quantity            = data.quantity,
            amount_usd          = data.amount_usd,
            amount_inr          = data.amount_inr,
            exchange_rate       = data.exchange_rate,    # Live rate stored for records
            payment_method      = data.method,
            status              = "SUCCESS",
            razorpay_order_id   = data.razorpay_order_id,
            razorpay_payment_id = data.razorpay_payment_id
        )

        db.add(txn)
        db.commit()
        print(f"[Payment] Transaction saved to DB: ID {txn.id}")

        # ── Generate QR Code ───────────────────────────────────────
        # QR encodes payment summary — can be scanned as a receipt
        qr_data = (
            f"PAYMENT RECEIPT\n"
            f"Product: {data.product}\n"
            f"Qty: {data.quantity}\n"
            f"USD: ${data.amount_usd}\n"
            f"INR: ₹{data.amount_inr}\n"
            f"Rate: 1 USD = ₹{data.exchange_rate}\n"
            f"Payment ID: {data.razorpay_payment_id}"
        )
        qr_url = generate_qr(qr_data)

        return {
            "status":     "SUCCESS",
            "payment_id": data.razorpay_payment_id,
            "qr":         qr_url,       # e.g. "/qr_codes/uuid.png"
            "message":    f"Payment of ₹{data.amount_inr} verified and saved successfully!"
        }

    except Exception as e:
        print(f"[Payment] DB save failed: {e}")
        raise HTTPException(status_code=500, detail=f"Payment verified but DB save failed: {str(e)}")


# ─── ENDPOINT 4: Get All Transactions ────────────────────────────────────────
@router.get("/transactions")
def get_transactions():
    """
    Returns all payment transactions from the database.
    Useful for an admin dashboard or transaction history page.

    GET /transactions
    Response: [ { id, product_name, quantity, amount_usd, amount_inr,
                  exchange_rate, payment_method, status, created_at }, ... ]
    """
    try:
        db = SessionLocal()
        transactions = db.query(Transaction).order_by(Transaction.created_at.desc()).all()
        return transactions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))