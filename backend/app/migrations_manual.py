from app.database import engine
from sqlalchemy import text

def add_description_column():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE products ADD COLUMN description VARCHAR(255) AFTER name"))
            conn.commit()
            print("Successfully added 'description' column to 'products' table.")
        except Exception as e:
            if "Duplicate column name" in str(e):
                print("Column 'description' already exists.")
            else:
                print(f"Error: {e}")

if __name__ == "__main__":
    add_description_column()
