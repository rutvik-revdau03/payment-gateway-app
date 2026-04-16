import httpx
import time

# ─── In-Memory Cache ──────────────────────────────────────────────────────────
# Stores the last fetched rate and when it was fetched
# This avoids calling the API on every single payment request
_cache = {
    "rate": None,        # Last fetched exchange rate (float)
    "fetched_at": 0      # Timestamp of last fetch (seconds since epoch)
}

# How long to keep the cached rate before fetching a fresh one (1 hour)
CACHE_DURATION_SECONDS = 3600

# Fallback rate used only if the API is completely unreachable
FALLBACK_RATE = 84.0


# ─── Fetch Live Rate from Frankfurter API ────────────────────────────────────
def get_live_usd_to_inr() -> float:
    """
    Fetches the live USD to INR exchange rate from the Frankfurter API.

    Features:
    - No API key required
    - Completely free with no request limits
    - Caches the rate for 1 hour to reduce API calls
    - Falls back to last known rate (or ₹84) if API is unreachable

    Returns:
        float: Current USD to INR exchange rate (e.g. 84.25)
    """
    now = time.time()

    # ── Check Cache ───────────────────────────────────────────────
    # If we already have a rate and it was fetched less than 1 hour ago, reuse it
    if _cache["rate"] is not None and (now - _cache["fetched_at"]) < CACHE_DURATION_SECONDS:
        print(f"[Currency] Using cached rate: 1 USD = ₹{_cache['rate']}")
        return _cache["rate"]

    # ── Fetch Fresh Rate from Frankfurter ─────────────────────────
    try:
        print("[Currency] Fetching live rate from Frankfurter API...")

        response = httpx.get(
            "https://api.frankfurter.dev/v2/rates",
            params={
                "base": "USD",      # Convert FROM USD
                "quotes": "INR"     # Convert TO INR
            },
            timeout=5.0             # Wait max 5 seconds for response
        )
        response.raise_for_status()  # Raise error if HTTP status is 4xx or 5xx

        data = response.json()

        # API response format:
        # [{"date": "2026-03-26", "base": "USD", "quote": "INR", "rate": 84.25}]
        rate = float(data[0]["rate"])

        # ── Save to Cache ─────────────────────────────────────────
        _cache["rate"] = rate
        _cache["fetched_at"] = now

        print(f"[Currency] Live rate fetched successfully: 1 USD = ₹{rate}")
        return rate

    except httpx.TimeoutException:
        print("[Currency] API request timed out.")
    except httpx.HTTPStatusError as e:
        print(f"[Currency] API returned error: {e.response.status_code}")
    except Exception as e:
        print(f"[Currency] Unexpected error: {e}")

    # ── Fallback ──────────────────────────────────────────────────
    # If API fails, use the last cached rate OR the hardcoded fallback
    fallback = _cache["rate"] if _cache["rate"] is not None else FALLBACK_RATE
    print(f"[Currency] Using fallback rate: 1 USD = ₹{fallback}")
    return fallback


# ─── Convert USD to INR ───────────────────────────────────────────────────────
def convert_usd_to_inr(amount_usd: float) -> dict:
    """
    Converts a USD amount to INR using the live exchange rate.

    Args:
        amount_usd (float): Amount in US Dollars (e.g. 19.99)

    Returns:
        dict: {
            "amount_inr": float,    → Converted INR amount (e.g. 1665.16)
            "rate": float,          → Exchange rate used (e.g. 84.25)
            "amount_usd": float     → Original USD amount
        }

    Example:
        convert_usd_to_inr(10.00)
        → {"amount_inr": 842.50, "rate": 84.25, "amount_usd": 10.00}
    """
    rate = get_live_usd_to_inr()
    amount_inr = round(amount_usd * rate, 2)

    return {
        "amount_inr": amount_inr,
        "rate": rate,
        "amount_usd": amount_usd
    }