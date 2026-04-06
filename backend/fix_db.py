from sqlalchemy import text
from app.database import engine

def fix_schema():
    print("[Schema Fixer] Attempting to add missing columns to transactions table...")
    try:
        with engine.connect() as conn:
            # Check if user_id exists
            result = conn.execute(text("SHOW COLUMNS FROM transactions LIKE 'user_id'"))
            if not result.fetchone():
                print("[Schema Fixer] Adding 'user_id' column to 'transactions' table...")
                conn.execute(text("ALTER TABLE transactions ADD COLUMN user_id INT"))
                conn.execute(text("ALTER TABLE transactions ADD CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id)"))
                conn.commit()
                print("[Schema Fixer] Successfully added user_id column and foreign key.")
            else:
                print("[Schema Fixer] Column 'user_id' already exists.")

            # Add 'role' column to 'users' table if missing
            result_role = conn.execute(text("SHOW COLUMNS FROM users LIKE 'role'"))
            if not result_role.fetchone():
                print("[Schema Fixer] Adding 'role' column to 'users' table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'normal'"))
                conn.commit()
                print("[Schema Fixer] Successfully added role column to users table.")
            else:
                print("[Schema Fixer] Column 'role' already exists in users table.")
    except Exception as e:
        print(f"[Schema Fixer] ❌ Failed to fix schema: {e}")

if __name__ == "__main__":
    fix_schema()
