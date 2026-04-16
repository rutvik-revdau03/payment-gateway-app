from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import product, payment, auth, cart
from app.database import engine
from app.models import Base
import os

# ─── Create All Database Tables ───────────────────────────────────────────────
# Reads all models (Product, Transaction) that inherit from Base
# and creates their tables in MySQL if they don't exist yet
Base.metadata.create_all(bind=engine)

# ─── Ensure QR Codes Folder Exists ───────────────────────────────────────────
# All generated QR code images will be saved here
if not os.path.exists("qr_codes"):
    os.makedirs("qr_codes")
    print("[Startup] ✅ qr_codes directory created")

# ─── Create FastAPI App Instance ─────────────────────────────────────────────
app = FastAPI(
    title="Payment Gateway API",
    description="FastAPI backend with Razorpay integration and live USD→INR via Frankfurter",
    version="2.0.0"
)

# ─── CORS Middleware ──────────────────────────────────────────────────────────
# Allows Angular (running on localhost:4200) to make requests to this API
# In production, replace "*" with your actual Angular app domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],   # Angular dev server
    allow_credentials=True,
    allow_methods=["*"],      # Allow GET, POST, PUT, DELETE etc.
    allow_headers=["*"],      # Allow all request headers
)

# ─── Register Route Files ─────────────────────────────────────────────────────
app.include_router(product.router)    # /products
app.include_router(payment.router)    # /exchange-rate...
app.include_router(auth.router)       # /auth/signup, /auth/login
app.include_router(cart.router)       # /cart/add...

# ─── Serve QR Code Images as Static Files ────────────────────────────────────
# QR images saved in qr_codes/ folder are served at /qr_codes/<filename>
# Angular can display them as: <img src="http://localhost:8000/qr_codes/uuid.png">
app.mount("/qr_codes", StaticFiles(directory="qr_codes"), name="qr")

