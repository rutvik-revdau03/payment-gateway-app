import bcrypt
from passlib.context import CryptContext

# ─── BCRYPT COMPATIBILITY FIXES (For Passlib + Bcrypt 4.x) ───────────────────

# FIX 1: Missing __about__ attribute
if not hasattr(bcrypt, "__about__"):
    bcrypt.__about__ = type("About", (), {"__version__": bcrypt.__version__})

# FIX 2: ValueError for passwords > 72 bytes
# Bcrypt 4.0+ throws ValueError for long passwords. Passlib (unmaintained) 
# expects the old behavior where bcrypt would just truncate to 72 bytes.
# We wrap bcrypt.hashpw to truncate manually, making it compatible with Passlib's internal tests.
original_hashpw = bcrypt.hashpw

def compatible_hashpw(password, salt):
    if isinstance(password, str):
        password = password.encode('utf-8')
    # Manually truncate to 72 bytes to prevent ValueError in Bcrypt 4.x
    return original_hashpw(password[:72], salt)

bcrypt.hashpw = compatible_hashpw
# ─────────────────────────────────────────────────────────────────────────────

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    """
    Hashes the password. 
    The compatible_hashpw fix above handles the 72-byte limit automatically.
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)
