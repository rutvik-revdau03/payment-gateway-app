import qrcode
import os
import uuid


def generate_qr(data: str) -> str:
    """
    Generates a QR code image from the given data string and saves it to disk.

    Improvements over original:
    - Uses a unique UUID filename for every payment
      (original always overwrote the same payment.png file)
    - Returns the public URL path so Angular can display it directly

    Args:
        data (str): The string to encode in the QR code
                    e.g. "PAY INR 1665.16 | ID:pay_ABC123"

    Returns:
        str: Public URL path to the saved QR image
             e.g. "/qr_codes/a1b2c3d4-e5f6.png"
    """
    folder = "qr_codes"
    os.makedirs(folder, exist_ok=True)   # Create folder if it doesn't exist

    # Generate a unique filename using UUID so each payment gets its own QR file
    # Without this, every payment would overwrite the same payment.png
    unique_filename = f"{uuid.uuid4()}.png"
    file_path = os.path.join(folder, unique_filename)

    # Generate the QR code image and save to disk
    img = qrcode.make(data)
    img.save(file_path)

    # Return the public URL path (served by FastAPI StaticFiles)
    # Angular can display this as: <img src="http://localhost:8000/qr_codes/xxxx.png">
    public_url = f"/qr_codes/{unique_filename}"
    print(f"[QR] QR code saved: {public_url}")

    return public_url