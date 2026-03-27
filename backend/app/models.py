from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DECIMAL, TIMESTAMP, text

Base = declarative_base()


# ─── TABLE 1: products ────────────────────────────────────────────────────────
class Product(Base):
    __tablename__ = "products"

    id    = Column(Integer, primary_key=True)   # Auto-increment primary key
    name  = Column(String(100))                  # Product name
    price = Column(DECIMAL(10, 2))              # Product price in USD


# ─── TABLE 2: transactions ────────────────────────────────────────────────────
class Transaction(Base):
    __tablename__ = "transactions"

    id                  = Column(Integer, primary_key=True)   # Auto-increment ID
    product_name        = Column(String(100))                  # Purchased product name
    quantity            = Column(Integer)                      # Units purchased
    amount_usd          = Column(DECIMAL(10, 2))              # Total in USD
    amount_inr          = Column(DECIMAL(10, 2))              # Total in INR (live rate)
    exchange_rate       = Column(DECIMAL(10, 4))              # Live USD→INR rate used
    payment_method      = Column(String(50))                   # e.g. "upi", "card"
    status              = Column(String(50))                   # "SUCCESS" or "FAILED"
    razorpay_order_id   = Column(String(100))                 # Razorpay order ID
    razorpay_payment_id = Column(String(100))                 # Razorpay payment ID
    created_at          = Column(
        TIMESTAMP,
        server_default=text('CURRENT_TIMESTAMP')              # Auto timestamp on insert
    )