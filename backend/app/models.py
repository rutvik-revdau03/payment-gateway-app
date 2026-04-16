from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DECIMAL, TIMESTAMP, text, ForeignKey
from sqlalchemy.orm import relationship

Base = declarative_base()


# ─── TABLE 1: products ────────────────────────────────────────────────────────
class Product(Base):
    __tablename__ = "products"

    id    = Column(Integer, primary_key=True)   # Auto-increment primary key
    name  = Column(String(100))                  # Product name
    price = Column(DECIMAL(10, 2))              # Product price in USD
    stock_quantity = Column(Integer, default=0) # Available quantity
    admin_id = Column(Integer, ForeignKey("users.id")) # Admin who added this

    admin = relationship("User", back_populates="managed_products")


# ─── TABLE 2: transactions (Payment Details) ──────────────────────────────────
class Transaction(Base):
    __tablename__ = "transactions"

    id                  = Column(Integer, primary_key=True)
    product_name        = Column(String(100))
    quantity            = Column(Integer)
    amount_usd          = Column(DECIMAL(10, 2))
    amount_inr          = Column(DECIMAL(10, 2))
    exchange_rate       = Column(DECIMAL(10, 4))
    payment_method      = Column(String(50))
    status              = Column(String(50))
    razorpay_order_id   = Column(String(100))
    razorpay_payment_id = Column(String(100))
    user_id             = Column(Integer, ForeignKey("users.id"))
    created_at          = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))
    
    user = relationship("User", back_populates="transactions")

# ─── TABLE 4: orders (Customer Facing Records) ────────────────────────────────
class Order(Base):
    __tablename__ = "orders"

    id           = Column(Integer, primary_key=True)     # Auto PK
    order_number = Column(String(50), unique=True)        # Formal Order ID (e.g. SW-123)
    user_id      = Column(Integer, ForeignKey("users.id")) # Link to user (FK)
    product_name = Column(String(100))
    quantity     = Column(Integer)
    total_usd    = Column(DECIMAL(10, 2))
    total_inr    = Column(DECIMAL(10, 2))
    status       = Column(String(20), default="Pending") # "Pending", "Completed"
    created_at   = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))

    user = relationship("User", back_populates="orders")

# ─── TABLE 3: users ──────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id       = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email    = Column(String(100), unique=True, index=True)
    password = Column(String(255))
    role     = Column(String(20), default="normal")     # "admin" or "normal"
    
    transactions = relationship("Transaction", back_populates="user")
    orders       = relationship("Order", back_populates="user")
    managed_products = relationship("Product", back_populates="admin")
    notifications = relationship("Notification", back_populates="user")
    cart_items = relationship("CartItem", back_populates="user")

# ─── TABLE 5: cart_items (Temporary stock holding) ──────────────────────────
class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    created_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))

    user = relationship("User", back_populates="cart_items")
    product = relationship("Product")

# ─── TABLE 6: notifications ──────────────────────────────────────────────────
class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String(255))
    is_read = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))

    user = relationship("User", back_populates="notifications")