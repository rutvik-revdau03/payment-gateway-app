import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // Base URL of your FastAPI backend
  baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  // ── Products ────────────────────────────────────────────────────

  /** GET /products — fetch all products from MySQL */
  getProducts(adminId?: number): Observable<any[]> {
    let url = `${this.baseUrl}/products`;
    if (adminId) url += `?admin_id=${adminId}`;
    return this.http.get<any[]>(url);
  }

  updateProduct(id: number, product: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/products/${id}`);
  }

  /** POST /products — add a new product to MySQL */
  addProduct(data: { name: string; price: number; stock_quantity: number; admin_id: number }) {
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

  getAdminTransactions(adminId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/admin/transactions/${adminId}`);
  }

  addToCart(data: { user_id: number; product_id: number; quantity: number }) {
    return this.http.post(`${this.baseUrl}/cart/add`, data);
  }

  removeFromCart(itemId: number) {
    return this.http.delete(`${this.baseUrl}/cart/${itemId}`);
  }

  getCart(userId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/cart/${userId}`);
  }

  getNotifications(userId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/cart/notifications/${userId}`);
  }

  notifyMe(userId: number, productId: number) {
    return this.http.post(`${this.baseUrl}/cart/notify-me?user_id=${userId}&product_id=${productId}`, {});
  }
}