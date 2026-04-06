# Payment Gateway Application

A full-stack application featuring a FastAPI backend and an Angular frontend, integrated with Razorpay for secure payments and Frankfurter for live USD-to-INR currency conversion.

## Key Features

- **Live Currency Conversion**: Automatically fetches the latest USD to INR exchange rates.
- **Role-Based Access Control (RBAC)**: Supports Admin and Normal user roles with different navigation and permissions.
- **Admin Dashboard**: Specialized interface for Admins to manage and add new products to the inventory.
- **Razorpay Integration**: Seamless 2-step payment process (Create Order → Verify Signature).
- **Automated QR Receipts**: Generates a unique QR code for every successful transaction.
- **Database Storage**: Stores product data, users, and transaction history in MySQL.
- **Modern UI**: Clean Material Design interface with standalone components and route guards.

## Project Structure

```bash
payment-gateway-app/
├── backend/            # FastAPI (Python)
│   ├── app/
│   │   ├── routes/     # API Endpoints (Auth, Product, Payment)
│   │   ├── services/   # Business Logic (Currency & QR)
│   │   └── models.py   # Database Schema (User, Product, Transaction)
│   └── main.py         # Entry point
├── frontend/           # Angular (TypeScript)
│   ├── src/app/
│   │   ├── pages/      # Route-level pages (Admin, Landing, Login, Signup)
│   │   ├── components/ # Reusable UI Components
│   │   ├── services/   # Backend API integration
│   │   └── guards/     # Route protection (AdminGuard)
└── PROJECT_DOCUMENTATION.md   # Detailed function and method analysis
```

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, Pydantic, Razorpay SDK, HTTPX.
- **Frontend**: Angular 17+ (Signals/Standalone), Angular Material.
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
