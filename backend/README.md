# Payment Gateway Backend (FastAPI)

The backend for the Payment Gateway application, built with FastAPI, MySQL, and Razorpay.

## Key Integrations

- **FastAPI**: Core framework for high-performance API endpoints.
- **Razorpay SDK**: Handles order creation and signature verification.
- **Frankfurter API**: Fetches live USD to INR exchange rates without an API key.
- **SQLAlchemy (MySQL)**: Database ORM for products and transaction management.
- **PyQRCode**: Generates unique QR-code receipts for every successful payment.

## API Endpoints

- **GET `/products`**: List all available products.
- **GET `/exchange-rate`**: Current live USD-to-INR conversion rate.
- **POST `/payment/create-order`**: Create a new Razorpay order.
- **POST `/payment/verify`**: Verify transaction and record to database.
- **GET `/transactions`**: View transaction history.

## Running Locally

1.  **Configure `.env`**:
    Add your Razorpay credentials and Database connection details to a `.env` file in this directory.

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Start the Server**:
    ```bash
    uvicorn app.main:app --reload
    ```
    Alternatively, use the command: `python -m uvicorn app.main:app --reload`
