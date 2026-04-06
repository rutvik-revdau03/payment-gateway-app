import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../services/api.services';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatExpansionModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="history-container page-wrapper">
      <div class="hero-section small-hero">
        <h1>Purchase <span class="accent">History</span></h1>
        <p>Track your previous orders and exclusive acquisitions.</p>
        <button mat-button class="back-link" (click)="goBack()"><mat-icon>arrow_back</mat-icon> Return to Store</button>
      </div>

      <div class="history-content">
        <div *ngIf="loading" class="center-loading">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Retrieving your order ledger...</p>
        </div>

        <div *ngFor="let order of orders; let i = index" class="order-item fadeIn" [style.animation-delay]="(i * 0.1) + 's'">
          <mat-expansion-panel class="premium-panel">
            <mat-expansion-panel-header>
              <mat-panel-title>
                 <div class="order-id-chip">#{{ order.razorpay_order_id.slice(-8) }}</div>
                 <span class="product-name-title">{{ order.product_name }}</span>
              </mat-panel-title>
              <mat-panel-description>
                 {{ order.created_at | date:'mediumDate' }}
              </mat-panel-description>
            </mat-expansion-panel-header>

            <div class="order-details-grid">
              <div class="detail-section">
                <div class="detail-row"><span>Quantity</span> <strong>{{ order.quantity }} Unit(s)</strong></div>
                <div class="detail-row"><span>Payment Method</span> <strong>{{ order.payment_method }}</strong></div>
                <div class="detail-row"><span>Transaction Date</span> <strong>{{ order.created_at | date:'mediumTime' }}</strong></div>
              </div>
              
              <div class="pricing-summary">
                <div class="price-box">
                  <p class="label">Total Paid (USD)</p>
                  <p class="value usd">\${{ order.amount_usd }}</p>
                </div>
                <div class="price-box highlight">
                  <p class="label">Total Paid (INR)</p>
                  <p class="value inr">₹{{ order.amount_inr }}</p>
                </div>
                <div class="rate-info">
                   <mat-icon>trending_up</mat-icon> Rate: ₹{{ order.exchange_rate }} / 1 USD
                </div>
              </div>
            </div>

            <div class="panel-actions">
              <button mat-raised-button color="primary" (click)="buyAgain(order)" class="highlight-pulse">
                <mat-icon>refresh</mat-icon> Purchase Again
              </button>
            </div>
          </mat-expansion-panel>
        </div>

        <div *ngIf="!loading && orders.length === 0" class="empty-history fadeIn">
          <div class="empty-icon-box">
            <mat-icon>history_toggle_off</mat-icon>
          </div>
          <h2>Your ledger is currently empty</h2>
          <p>Once you make your first purchase, your detailed receipt history will appear here.</p>
          <button mat-raised-button color="primary" (click)="goBack()" style="margin-top: 2rem;">Discover Products</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .history-container { min-height: 100vh; background: var(--color-bg); padding-bottom: 5rem; }
    .hero-section.small-hero { background: var(--gradient-main); padding: 5rem 2rem; text-align: center; color: white; clip-path: ellipse(150% 100% at 50% 0%); }
    .hero-section h1 { font-size: 3rem; margin-bottom: 0.5rem; font-family: 'Outfit', sans-serif; }
    .back-link { color: white !important; margin-top: 1rem; opacity: 0.8; }
    .back-link:hover { opacity: 1; }
    
    .history-content { max-width: 1000px; margin: -3rem auto 0; padding: 0 2rem; position: relative; z-index: 5; }
    .order-item { margin-bottom: 1.5rem; }
    .premium-panel { border-radius: 20px !important; border: none !important; box-shadow: var(--shadow-md) !important; overflow: hidden; }
    
    .order-id-chip { background: #eef2ff; color: #6366f1; padding: 0.3rem 0.8rem; border-radius: 8px; font-weight: 700; font-size: 0.85rem; margin-right: 1.5rem; font-family: 'Outfit'; }
    .product-name-title { font-weight: 600; color: var(--color-text); }
    
    .order-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; padding: 2rem; background: #fafafa; border-radius: 15px; margin: 1rem 0; }
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.95rem; color: var(--color-text-l); border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem; }
    
    .pricing-summary { display: flex; flex-direction: column; gap: 1rem; }
    .price-box { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; background: white; border-radius: 12px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
    .price-box.highlight { background: #f0fdf4; border: 1px solid #dcfce7; }
    .price-box p { margin: 0; }
    .price-box .label { font-size: 0.8rem; color: var(--color-text-l); font-weight: 600; text-transform: uppercase; }
    .price-box .value { font-size: 1.25rem; font-weight: 800; }
    .price-box .value.inr { color: #166534; }
    
    .rate-info { font-size: 0.85rem; color: var(--color-text-l); display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; }
    .rate-info mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; color: #6366f1; }
    
    .panel-actions { display: flex; justify-content: flex-end; padding: 1rem 0 0.5rem; }
    
    .center-loading { padding: 5rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; color: var(--color-text-l); }
    .empty-history { text-align: center; padding: 6rem 2rem; background: white; border-radius: 30px; box-shadow: var(--shadow-lg); }
    .empty-icon-box { width: 100px; height: 100px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; color: var(--color-text-l); }
    .empty-icon-box mat-icon { font-size: 3.5rem; width: 3.5rem; height: 3.5rem; }
    
    @media (max-width: 768px) {
      .order-details-grid { grid-template-columns: 1fr; gap: 2rem; padding: 1.5rem; }
    }
  `]
})
export class OrderHistoryComponent implements OnInit {
  api = inject(ApiService);
  cart = inject(CartService);
  router = inject(Router);

  orders: any[] = [];
  loading = true;

  ngOnInit() {
    const userId = parseInt(localStorage.getItem('userId') || '0');
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.api.getTransactions(userId).subscribe({
      next: (res: any) => {
        this.orders = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        console.error('Failed to load transaction history');
      }
    });
  }

  buyAgain(order: any) {
    // Helper to find icon (reusing our mapping logic)
    let icon = 'inventory_2';
    if (order.product_name.toLowerCase().includes('mobile')) icon = 'smartphone';
    else if (order.product_name.toLowerCase().includes('tablet')) icon = 'tablet_android';
    else if (order.product_name.toLowerCase().includes('laptop')) icon = 'laptop';
    else if (order.product_name.toLowerCase().includes('ipod')) icon = 'music_note';

    this.cart.addToCart({
      id: Math.random(), // Dummy ID to avoid conflicts
      name: order.product_name,
      price: parseFloat(order.amount_usd) / order.quantity,
      icon: icon
    });
    this.router.navigate(['/products']); // Go to cart
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
