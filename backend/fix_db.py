from sqlalchemy import text
from app.database import engine

def fix_schema():
    print("[Schema Fixer] Attempting to stabilize database schema...")
    try:
        with engine.connect() as conn:
            # 1. Add missing columns to transactions
            result = conn.execute(text("SHOW COLUMNS FROM transactions LIKE 'user_id'"))
            if not result.fetchone():
                print("[Schema Fixer] Adding 'user_id' column to 'transactions' table...")
                conn.execute(text("ALTER TABLE transactions ADD COLUMN user_id INT"))
                conn.execute(text("ALTER TABLE transactions ADD CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id)"))
                conn.commit()
            
            # 2. Add columns to products if missing
            col_stock = conn.execute(text("SHOW COLUMNS FROM products LIKE 'stock_quantity'")).fetchone()
            if not col_stock:
                print("[Schema Fixer] Adding 'stock_quantity' to products...")
                conn.execute(text("ALTER TABLE products ADD COLUMN stock_quantity INT DEFAULT 0"))
                conn.commit()

            col_admin = conn.execute(text("SHOW COLUMNS FROM products LIKE 'admin_id'")).fetchone()
            if not col_admin:
                print("[Schema Fixer] Adding 'admin_id' to products...")
                conn.execute(text("ALTER TABLE products ADD COLUMN admin_id INT DEFAULT 1"))
                conn.commit()

            # 3. Assign random admins to products that don't have one
            admins = conn.execute(text("SELECT id FROM users WHERE role = 'admin'")).fetchall()
            admin_ids = [row[0] for row in admins]
            
            if admin_ids:
                print(f"[Schema Fixer] Found {len(admin_ids)} admins. Assigning them to products...")
                products = conn.execute(text("SELECT id FROM products")).fetchall()
                for p in products:
                    import random
                    chosen_admin = random.choice(admin_ids)
                    conn.execute(text("UPDATE products SET admin_id = :admin_id WHERE id = :prod_id"), {"admin_id": chosen_admin, "prod_id": p[0]})
                conn.commit()
            
            # 4. Initialize stock levels
            print("[Schema Fixer] Setting default stock for empty products...")
            conn.execute(text("UPDATE products SET stock_quantity = 50 WHERE stock_quantity = 0 OR stock_quantity IS NULL"))
            conn.commit()

    except Exception as e:
        print(f"[Schema Fixer] ❌ Failed to fix schema: {e}")

if __name__ == "__main__":
    fix_schema()
