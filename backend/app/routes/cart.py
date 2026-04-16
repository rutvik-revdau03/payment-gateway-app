from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product, CartItem, Notification, User
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/cart", tags=["cart"])

class CartAdd(BaseModel):
    user_id: int
    product_id: int
    quantity: int

class CartResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product_name: str
    price: float

# ─── ADD TO CART ─────────────────────────────────────────────────────────────
@router.post("/add")
def add_to_cart(data: CartAdd, db: Session = Depends(get_db)):
    # 1. Prevent Admins from adding to cart
    from app.models import User
    user = db.query(User).filter(User.id == data.user_id).first()
    if user and user.role == 'admin':
        return {"error": "ADMIN_RESTRICTED", "message": "Administrators only add products, they cannot shop."}

    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if we have enough stock
    if product.stock_quantity < data.quantity:
        # User requested more than available
        # Notify the Admin who added this product
        admin_notif = Notification(
            user_id = product.admin_id,
            message = f"Out of stock alert: '{product.name}' was requested by user {data.user_id} but it's unavailable."
        )
        db.add(admin_notif)
        db.commit()

        return {
            "error": "OUT_OF_STOCK",
            "message": f"Sorry, '{product.name}' is currently out of stock.",
            "can_notify": True
        }

    # Deduct temporarily from stock
    product.stock_quantity -= data.quantity
    
    # Check if it just ran out
    if product.stock_quantity == 0:
        admin_notif = Notification(
            user_id = product.admin_id,
            message = f"Inventory alert: '{product.name}' is now out of stock."
        )
        db.add(admin_notif)

    # Save to Cart
    cart_item = CartItem(
        user_id = data.user_id,
        product_id = data.product_id,
        quantity = data.quantity
    )
    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)

    return {"message": "Added to cart", "cart_item_id": cart_item.id}

# ─── REMOVE FROM CART (DEDUCT/RESTORE STOCK) ─────────────────────────────────
@router.delete("/{item_id}")
def remove_from_cart(item_id: int, db: Session = Depends(get_db)):
    cart_item = db.query(CartItem).filter(CartItem.id == item_id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    # Return quantity back to stock
    product = db.query(Product).filter(Product.id == cart_item.product_id).first()
    if product:
        product.stock_quantity += cart_item.quantity
    
    db.delete(cart_item)
    db.commit()

    return {"message": "Removed from cart, stock restored"}

# ─── GET CART ITEMS ──────────────────────────────────────────────────────────
@router.get("/{user_id}")
def get_cart(user_id: int, db: Session = Depends(get_db)):
    items = db.query(CartItem).filter(CartItem.user_id == user_id).all()
    results = []
    for item in items:
        prod = db.query(Product).filter(Product.id == item.product_id).first()
        results.append({
            "id": item.id,
            "product_id": item.product_id,
            "name": prod.name if prod else "Unknown",
            "quantity": item.quantity,
            "price": float(prod.price) if prod else 0.0
        })
    return results

# ─── NOTIFY ME REQUEST ───────────────────────────────────────────────────────
@router.post("/notify-me")
def notify_me(user_id: int, product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    
    # Notify User that we will notify them (log for now)
    user_notif = Notification(
        user_id = user_id,
        message = f"Notification set: We will tell you when '{product.name if product else 'this item'}' is back in stock."
    )
    
    # Also notify Admin that a user is interested
    admin_notif = Notification(
        user_id = product.admin_id if product else 1, # Default to first admin if prod missing
        message = f"Customer Interest: User {user_id} wants to be notified when '{product.name if product else 'item'}' is restocked."
    )
    
    db.add(user_notif)
    db.add(admin_notif)
    db.commit()
    
    return {"message": "You will be notified when this is back in stock!"}

# ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
@router.get("/notifications/{user_id}")
def get_notifications(user_id: int, db: Session = Depends(get_db)):
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()
