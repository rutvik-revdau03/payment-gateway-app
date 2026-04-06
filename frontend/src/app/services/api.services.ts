import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // Base URL of your FastAPI backend
  baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  // ── Products ────────────────────────────────────────────────────

  /** GET /products — fetch all products from MySQL */
  getProducts() {
    return this.http.get(`${this.baseUrl}/products`);
  }

  /** POST /products — add a new product to MySQL */
  addProduct(data: { name: string; price: number }) {
    return this.http.post(`${this.baseUrl}/products`, data);
  }

  // ── Currency ────────────────────────────────────────────────────

  /** GET /exchange-rate — fetch live USD to INR rate from Frankfurter */
  getExchangeRate() {
    return this.http.get(`${this.baseUrl}/exchange-rate`);
  }

  // ── Razorpay Payment (2-step flow) ──────────────────────────────

  /**
   * POST /payment/create-order
   * Step 1: Creates a Razorpay order on the backend
   * Backend converts USD → INR using live Frankfurter rate
   * Returns order_id, amount (paise), key, usd, inr, rate
   */
  createOrder(data: { product: string; price: number; quantity: number; method: string; user_id: number }) {
    return this.http.post(`${this.baseUrl}/payment/create-order`, data);
  }

  /**
   * POST /payment/verify
   * Step 2: Verifies the Razorpay payment signature on the backend
   * Saves verified transaction to MySQL DB
   * Returns status, payment_id, qr url, message
   */
  verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    product: string;
    quantity: number;
    amount_usd: number;
    amount_inr: number;
    exchange_rate: number;
    method: string;
    user_id: number;
  }) {
    return this.http.post(`${this.baseUrl}/payment/verify`, data);
  }

  /** GET /transactions/{user_id} — fetch past transactions for current user */
  getTransactions(userId: number) {
    return this.http.get(`${this.baseUrl}/transactions/${userId}`);
  }
}