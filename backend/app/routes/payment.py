from app.database import SessionLocal
from app.models import Transaction, Order
from app.services.currency import convert_usd_to_inr, get_live_usd_to_inr
from app.services.qr import generate_qr
import uuid
import os
import razorpay
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

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
    user_id: int       # Logged-in user's ID


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
    user_id: int              # User ID to link transaction


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
    Step 1: Create Razorpay order and pre-save a 'Pending' entry in our 'orders' table.
    """
    try:
        total_usd = round(data.price * data.quantity, 2)
        conversion = convert_usd_to_inr(total_usd)

        total_inr = conversion["amount_inr"]
        live_rate = conversion["rate"]

        amount_paise = int(total_inr * 100)

        # 1. Create Razorpay Order
        rzp_order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": f"receipt_{data.product}_{data.quantity}",
            "notes": {
                "product": data.product,
                "user_id": str(data.user_id)
            }
        })

        # 2. Pre-save formal Order to our database as 'Pending'
        # This gives us a record of an intent to buy
        db = SessionLocal()
        new_order = Order(
            order_number = f"SW-{uuid.uuid4().hex[:8].upper()}", # e.g. SW-A1B2C3D4
            user_id      = data.user_id,
            product_name = data.product,
            quantity     = data.quantity,
            total_usd    = total_usd,
            total_inr    = total_inr,
            status       = "Pending"
        )
        db.add(new_order)
        db.commit()
        db.refresh(new_order)

        print(f"[Order] Created record {new_order.order_number} for user {data.user_id}")

        return {
            "order_id":  rzp_order["id"],          # Razorpay ID
            "order_no":  new_order.order_number,   # Our Internal ID
            "amount":    amount_paise,
            "currency":  "INR",
            "key":       os.getenv("RAZORPAY_KEY_ID"),
            "usd":       total_usd,
            "inr":       total_inr,
            "rate":      live_rate
        }

    except Exception as e:
        print(f"[Payment] Order creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Order creation failed: {str(e)}")


# ─── ENDPOINT 3: Verify Payment & Finalize Order ─────────────────────────────
@router.post("/payment/verify")
def verify_payment(data: VerifyRequest):
    """
    Step 2: Verify signature, save transaction, and mark order as 'Completed'.
    """
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id":   data.razorpay_order_id,
            "razorpay_payment_id": data.razorpay_payment_id,
            "razorpay_signature":  data.razorpay_signature
        })
        print(f"[Payment] Signature verified for: {data.razorpay_payment_id}")

    except Exception:
        raise HTTPException(status_code=400, detail="Payment verification failed.")

    try:
        db = SessionLocal()

        # 1. Update our 'orders' table status to 'Completed'
        # We find the latest pending order for this user and product
        order_record = db.query(Order).filter(
            Order.user_id == data.user_id,
            Order.product_name == data.product,
            Order.status == "Pending"
        ).order_by(Order.created_at.desc()).first()

        if order_record:
            order_record.status = "Completed"
            print(f"[Order] Marked {order_record.order_number} as Completed")

        # 2. Save the transaction details (receipt)
        txn = Transaction(
            product_name        = data.product,
            quantity            = data.quantity,
            amount_usd          = data.amount_usd,
            amount_inr          = data.amount_inr,
            exchange_rate       = data.exchange_rate,
            payment_method      = data.method,
            status              = "SUCCESS",
            razorpay_order_id   = data.razorpay_order_id,
            razorpay_payment_id = data.razorpay_payment_id,
            user_id             = data.user_id
        )

        db.add(txn)
        db.commit()

        # 3. Generate QR Code
        qr_data = f"RECEIPT: {data.razorpay_payment_id}\nProduct: {data.product}\nTotal: ₹{data.amount_inr}"
        qr_url = generate_qr(qr_data)

        return {
            "status":        "SUCCESS",
            "payment_id":    data.razorpay_payment_id,
            "qr":            qr_url,
            "product":       data.product,
            "quantity":      data.quantity,
            "usd":           data.amount_usd,
            "inr":           data.amount_inr,
            "exchange_rate": data.exchange_rate,
            "message":       "Order completed successfully!"
        }

    except Exception as e:
        print(f"[Payment] DB error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── ENDPOINT 4: Get User Orders ─────────────────────────────────────────────
@router.get("/orders/{user_id}")
def get_user_orders(user_id: int):
    """
    Returns only formal 'Completed' orders for a user.
    """
    try:
        db = SessionLocal()
        orders = db.query(Order).filter(Order.user_id == user_id, Order.status == "Completed").order_by(Order.created_at.desc()).all()
        return orders
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── ENDPOINT 5: Get User Transactions ───────────────────────────────────────
@router.get("/transactions/{user_id}")
def get_transactions(user_id: int):
    """
    Returns payment transactions for a specific user.
    """
    try:
        db = SessionLocal()
        transactions = db.query(Transaction).filter(Transaction.user_id == user_id).order_by(Transaction.created_at.desc()).all()
        return transactions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))