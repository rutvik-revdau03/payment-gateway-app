from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

DB_USER     = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST     = os.getenv("DB_HOST", "localhost")
DB_PORT     = os.getenv("DB_PORT", "3306")
DB_NAME     = os.getenv("DB_NAME")

# URI encode the password in case it contains special characters like @, #, $
encoded_password = quote_plus(DB_PASSWORD) if DB_PASSWORD else ""

# Build full MySQL connection string
# Format: mysql+pymysql://user:password@host:port/dbname
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create the SQLAlchemy engine — actual connection to the database
engine = create_engine(DATABASE_URL)

# SessionLocal is a factory — call SessionLocal() to open a new DB session
SessionLocal = sessionmaker(bind=engine)