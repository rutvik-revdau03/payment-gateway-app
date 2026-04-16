from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product

router = APIRouter(prefix="/products", tags=["products"])


# ─── Request Model ────────────────────────────────────────────────────────────
class ProductCreate(BaseModel):
    """Data required to add a new product"""
    name: str          # Product name e.g. "Laptop"
    price: float       # Price in USD e.g. 999.99
    stock_quantity: int
    admin_id: int


# ─── ENDPOINT 1: Get All Products ────────────────────────────────────────────
@router.get("/")
def get_products(admin_id: int = None, db: Session = Depends(get_db)):
    from app.models import User
    try:
        # Start query with outerjoin to include products even if admin doesn't exist
        query = db.query(Product, User.username.label('admin_name')).outerjoin(User, Product.admin_id == User.id)
        
        # Apply filter only if admin_id is provided and valid
        if admin_id is not None and admin_id > 0:
            print(f"[API] Fetching products for Admin ID: {admin_id}")
            query = query.filter(Product.admin_id == admin_id)
        
        results = []
        db_rows = query.all()
        for p, name in db_rows:
            results.append({
                "id": p.id, 
                "name": p.name, 
                "price": float(p.price), 
                "stock_quantity": p.stock_quantity, 
                "admin_id": p.admin_id,
                "admin_name": name or "Global Admin"
            })
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{product_id}")
def update_product(product_id: int, data: ProductCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product: raise HTTPException(status_code=404, detail="Product not found")
    product.name = data.name
    product.price = data.price
    product.stock_quantity = data.stock_quantity
    db.commit()
    return product

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product: raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfuly"}


# ─── ENDPOINT 2: Add a New Product ───────────────────────────────────────────
@router.post("/")
def add_product(data: ProductCreate, db: Session = Depends(get_db)):
    """
    Adds a new product to the database.

    POST /products
    Body: { name, price }
    Response: { id, name, price }
    """
    try:

        product = Product(
            name  = data.name,
            price = data.price,
            stock_quantity = data.stock_quantity,
            admin_id = data.admin_id
        )

        db.add(product)
        db.commit()
        db.refresh(product)   # Refresh to get the auto-generated ID

        print(f"[Product] Added: {product.name} @ ${product.price}")
        return product

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()