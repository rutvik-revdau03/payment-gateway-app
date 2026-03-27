from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import SessionLocal
from app.models import Product

router = APIRouter()


# ─── Request Model ────────────────────────────────────────────────────────────
class ProductCreate(BaseModel):
    """Data required to add a new product"""
    name: str          # Product name e.g. "Laptop"
    price: float       # Price in USD e.g. 999.99


# ─── ENDPOINT 1: Get All Products ────────────────────────────────────────────
@router.get("/products")
def get_products():
    """
    Returns all products from the database.

    GET /products
    Response: [ { id, name, price }, ... ]
    """
    try:
        db = SessionLocal()
        products = db.query(Product).all()
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()    # Always close DB session to prevent connection leaks


# ─── ENDPOINT 2: Add a New Product ───────────────────────────────────────────
@router.post("/products")
def add_product(data: ProductCreate):
    """
    Adds a new product to the database.

    POST /products
    Body: { name, price }
    Response: { id, name, price }
    """
    try:
        db = SessionLocal()

        product = Product(
            name  = data.name,
            price = data.price
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