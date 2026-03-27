# Payment Gateway Application

A full-stack application featuring a FastAPI backend and an Angular frontend, integrated with Razorpay for secure payments and Frankfurter for live USD-to-INR currency conversion.

## Key Features

- **Live Currency Conversion**: Automatically fetches the latest USD to INR exchange rates.
- **Razorpay Integration**: Seamless 2-step payment process (Create Order → Verify Signature).
- **Automated QR Receipts**: Generates a unique QR code for every successful transaction.
- **Database Storage**: Stores product data and transaction history in MySQL.
- **Modern UI**: Clean Material Design interface for smooth product selection and checkout.

## Project Structure

```bash
payment-gateway-app/
├── backend/            # FastAPI (Python)
│   ├── app/
│   │   ├── routes/     # API Endpoints
│   │   ├── services/   # Business Logic (Currency & QR)
│   │   └── models.py   # Database Schema
│   └── main.py         # Entry point
├── frontend/           # Angular (TypeScript)
│   ├── src/app/
│   │   ├── components/ # UI Components (Products, Payment, Success)
│   │   └── services/   # Backend API integration
└── PROJECT_DOCUMENTATION.md   # Detailed function and method analysis
```

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, Pydantic, Razorpay SDK, HTTPX.
- **Frontend**: Angular 17+, Angular Material, Razorpay Checkout SDK.
- **Database**: MySQL.
- **Services**: Frankfurter API (Exchange Rates).

## Documentation

For a detailed analysis of all functions and methods used in this project, please refer to:
 **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)**

## Setup & Running

1.  **Backend**:
    - Build virtual environment: `python -m venv venv`
    - Install dependencies: `pip install -r backend/requirements.txt`
    - Configure `.env` with MySQL and Razorpay credentials.
    - Run: `uvicorn app.main:app --reload`
2.  **Frontend**:
    - Install dependencies: `npm install`
    - Run: `ng serve`
