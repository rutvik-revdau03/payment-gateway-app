from app.database import engine
from sqlalchemy import text

def fix():
    try:
        with engine.connect() as conn:
            conn.execute(text("UPDATE products SET stock_quantity = 10"))
            conn.commit()
            print("DONE: All product quantities updated to 10.")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    fix()
