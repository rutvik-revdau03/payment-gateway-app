import { Component, OnInit, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.services';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

declare var Razorpay: any;

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {

  order: any = {};
  method: string = 'UPI';

  loading: boolean = false;
  paymentInProgress: boolean = false;
  result: any = null;

  liveRate: number | null = null;
  totalUsd: number = 0;
  totalInr: number = 0;

  private pendingOrder: any = null;

  constructor(
    private api: ApiService,
    private router: Router,
    private ngZone: NgZone,

    // FIX 1: PLATFORM_ID tells us if we are running in browser or Node.js (SSR)
    // localStorage only exists in the browser — calling it in Node.js (SSR)
    // throws "localStorage is not defined" and crashes the whole component
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // FIX 1: Guard ALL browser-only APIs with isPlatformBrowser()
    // This check returns true in browser, false in Node.js SSR server
    // Without this guard, SSR crashes immediately on this line
    if (!isPlatformBrowser(this.platformId)) {
      return;   // ← Exit early on server — no localStorage, no Razorpay on server
    }

    const stored = localStorage.getItem('order');
    if (!stored) {
      alert('No order found. Please select a product first.');
      this.router.navigate(['/']);
      return;
    }

    this.order = JSON.parse(stored);

    this.totalUsd = parseFloat(
      (this.order.product.price * this.order.quantity).toFixed(2)
    );

    this.api.getExchangeRate().subscribe({
      next: (res: any) => {
        this.liveRate = res.rate;
        this.totalInr = parseFloat((this.totalUsd * res.rate).toFixed(2));
      },
      error: () => {
        console.warn('[Payment] Could not fetch live rate');
      }
    });
  }

  pay() {
    // FIX 1: Also guard pay() — Razorpay popup is browser-only
    if (!isPlatformBrowser(this.platformId)) return;

    this.loading = true;

    this.api.createOrder({
      product:  this.order.product.name,
      price:    this.order.product.price,
      quantity: this.order.quantity,
      method:   this.method
    }).subscribe({
      next: (orderRes: any) => {
        this.loading = false;
        this.pendingOrder = orderRes;

        this.totalUsd = orderRes.usd;
        this.totalInr = orderRes.inr;
        this.liveRate = orderRes.rate;

        this.openRazorpay(orderRes);
      },
      error: (err) => {
        this.loading = false;
        alert('Failed to create order. Please try again.');
        console.error(err);
      }
    });
  }

  openRazorpay(orderRes: any) {
    this.paymentInProgress = true;

    const options = {
      key:         orderRes.key,
      amount:      orderRes.amount,
      currency:    orderRes.currency,
      name:        'Payment Gateway',
      description: `${this.order.product.name} x ${this.order.quantity}`,
      order_id:    orderRes.order_id,

      // FIX 2: ngZone.run() forces Angular change detection after Razorpay callback
      // Razorpay runs its callbacks OUTSIDE Angular's zone — without ngZone.run(),
      // Angular never sees the state change and the button stays "Processing payment..."
      handler: (response: any) => {
        this.ngZone.run(() => {
          this.paymentInProgress = false;
          this.loading = true;
          this.verifyPayment(response);
        });
      },

      prefill: { name: '', email: '', contact: '' },
      theme: { color: '#3f51b5' },

      modal: {
        ondismiss: () => {
          // FIX 2: Also wrapped — resets button when user cancels popup
          this.ngZone.run(() => {
            this.paymentInProgress = false;
            this.loading = false;
          });
        }
      }
    };

    const rzp = new Razorpay(options);

    rzp.on('payment.failed', (response: any) => {
      // FIX 2: Also wrapped — resets button on payment failure
      this.ngZone.run(() => {
        this.paymentInProgress = false;
        this.loading = false;
        alert(`Payment failed: ${response.error.description}`);
        console.error(response.error);
      });
    });

    rzp.open();
  }

  verifyPayment(razorpayResponse: any) {
    this.api.verifyPayment({
      razorpay_order_id:   razorpayResponse.razorpay_order_id,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_signature:  razorpayResponse.razorpay_signature,
      product:             this.order.product.name,
      quantity:            this.order.quantity,
      amount_usd:          this.pendingOrder.usd,
      amount_inr:          this.pendingOrder.inr,
      exchange_rate:       this.pendingOrder.rate,
      method:              this.method
    }).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.result = res;
        localStorage.removeItem('order');
      },
      error: () => {
        this.loading = false;
        this.paymentInProgress = false;
        alert('Payment verification failed. Contact support with your payment ID.');
      }
    });
  }

  goSuccess() {
    this.router.navigate(['/success']);7
  }

  goBack() {
    this.router.navigate(['/']);
  }
}