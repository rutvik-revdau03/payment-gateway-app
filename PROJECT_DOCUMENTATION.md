# Payment Gateway App: Project Documentation

This document provides a detailed analysis of all functions, methods, and components within the Payment Gateway application.

---

## Backend (FastAPI)

The backend is built with FastAPI, SQLAlchemy (MySQL), and integrates with Razorpay for payments and Frankfurter for live exchange rates.

### `backend/app/main.py`
The entry point of the FastAPI application.
- **`root()`**:
  - **Type**: GET Endpoint (`/`)
  - **Description**: A simple health check endpoint to confirm the API is running.
  - **Returns**: A JSON object with the status and a welcome message.

### `backend/app/database.py`
Handles the database connection and session management.
- **`SessionLocal()`**:
  - **Type**: Factory
  - **Description**: Creates a new database session for interacting with the MySQL database.

### `backend/app/models.py`
Defines the database schema using SQLAlchemy.
- **`Product`**:
  - **Fields**: `id`, `name`, `price` (USD).
- **`Transaction`**:
  - **Fields**: `id`, `product_name`, `quantity`, `amount_usd`, `amount_inr`, `exchange_rate`, `payment_method`, `status`, `razorpay_order_id`, `razorpay_payment_id`, `created_at`.

### `backend/app/routes/payment.py`
Manages all payment-related endpoints and logic.
- **`get_exchange_rate()`**:
  - **Type**: GET Endpoint (`/exchange-rate`)
  - **Description**: Fetches the live USD to INR exchange rate via the `currency` service.
- **`create_order(data: OrderRequest)`**:
  - **Type**: POST Endpoint (`/payment/create-order`)
  - **Description**: Converts the order amount from USD to INR, calculates the total (including quantity), and creates an order with Razorpay.
  - **Parameters**: `OrderRequest` (product, price, quantity, method).
- **`verify_payment(data: VerifyRequest)`**:
  - **Type**: POST Endpoint (`/payment/verify`)
  - **Description**: Verifies the Razorpay payment signature, saves the transaction to the database, and generates a QR code receipt.
  - **Parameters**: `VerifyRequest` (signature, order_id, payment_id, and order details).
- **`get_transactions()`**:
  - **Type**: GET Endpoint (`/transactions`)
  - **Description**: Retrieves all recorded transactions from the database, ordered by date.

### `backend/app/routes/product.py`
Handles product-related operations.
- **`get_products()`**:
  - **Type**: GET Endpoint (`/products`)
  - **Description**: Fetches all products stored in the `products` table.
- **`add_product(data: ProductCreate)`**:
  - **Type**: POST Endpoint (`/products`)
  - **Description**: Adds a new product to the database.
  - **Parameters**: `ProductCreate` (name, price in USD).

### `backend/app/services/currency.py`
External service integration for exchange rates.
- **`get_live_usd_to_inr()`**:
  - **Type**: Helper Function
  - **Description**: Fetches the live USD to INR rate from the Frankfurter API with a 1-hour cache and local fallback.
- **`convert_usd_to_inr(amount_usd: float)`**:
  - **Type**: Helper Function
  - **Description**: Converts a specific USD amount to INR based on the live rate.

### `backend/app/services/qr.py`
Generates QR codes for receipts.
- **`generate_qr(data: str)`**:
  - **Type**: Helper Function
  - **Description**: Generates a PNG QR code image containing the payment summary and saves it to the `qr_codes/` directory with a unique UUID filename.

---

## Frontend (Angular)

The frontend is a standalone Angular application using Material Design and the Razorpay Checkout SDK.

### `frontend/src/app/services/api.services.ts`
The central service for all backend communication.
- **`getProducts()`**: Fetches products from `/products`.
- **`getExchangeRate()`**: Fetches the live rate from `/exchange-rate`.
- **`createOrder(data)`**: Initiates order creation at `/payment/create-order`.
- **`verifyPayment(data)`**: Verifies payment outcome at `/payment/verify`.
- **`getTransactions()`**: Fetches transaction history from `/transactions`.

### `frontend/src/app/components/products/products.component.ts`
The landing page where users select products.
- **`ngOnInit()`**: Initializes product list and exchange rate display.
- **`loadProducts()`**: Calls `ApiService` to populate the product list.
- **`loadExchangeRate()`**: Fetches and displays the live conversion rate.
- **`estimatedInr()` (Getter)**: Dynamically calculates the INR price based on selection/quantity.
- **`proceed()`**: Saves the selected order to `localStorage` and navigates to the payment page.

### `frontend/src/app/components/payment/payment.component.ts`
The checkout page where payment is processed.
- **`ngOnInit()`**: Loads order data from `localStorage` and fetches the latest rate.
- **`pay()`**: Calls the backend to create a Razorpay order.
- **`openRazorpay(orderRes)`**: Launches the Razorpay payment modal using the provided order details.
- **`verifyPayment(razorpayResponse)`**: Passes the Razorpay result back to the backend for verification and storage.
- **`goSuccess()`**: Navigates to the success page after confirmation.

### `frontend/src/app/components/success/success.component.ts`
The final confirmation page.
- **`newOrder()`**: Resets the flow by navigating back to the product selection.
