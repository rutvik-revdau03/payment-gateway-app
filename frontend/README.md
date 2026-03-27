# Payment Gateway Frontend (Angular)

The frontend for the Payment Gateway application, built with Angular 17+ and Material Design.

## Features

- **Dynamic Product Selection**: Fetches products from the FastAPI backend.
- **Estimated INR Display**: Automatically converts USD prices to INR using live conversion rates.
- **Razorpay Checkout Integration**: Facilitates secure online payments via the integrated Razorpay popup.
- **Responsive Payment UI**: A clean, material-designed interface for a professional checkout experience.

## Main Components

- **Products Component**: Select products and set quantities.
- **Payment Component**: Integrated Razorpay handler for processing payments.
- **Success Component**: Confirmation screen for completed transactions.
- **API Service**: Handles all communication with the FastAPI backend.

## Running Globally

Ensure the Angular CLI is installed:
```bash
npm install -g @angular/cli
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
ng serve
```
Open `http://localhost:4200/` in your browser.

## Build for Production

To create a production build:
```bash
ng build --configuration production
```
The output will be in the `dist/` directory.
