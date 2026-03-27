import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.services';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {

  products: any[] = [];
  selected: any = null;
  quantity: number = 1;

  exchangeRate: number | null = null;
  rateMessage: string = 'Fetching live rate...';

  loading: boolean = false;

  constructor(
    private api: ApiService,
    private router: Router,

    // FIX: PLATFORM_ID to detect browser vs SSR server environment
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadExchangeRate();
  }

  loadProducts() {
    this.loading = true;
    this.api.getProducts().subscribe({
      next: (res: any) => {
        this.products = res;
        this.loading = false;
      },
      error: () => {
        alert('Failed to load products. Make sure the backend is running.');
        this.loading = false;
      }
    });
  }

  loadExchangeRate() {
    this.api.getExchangeRate().subscribe({
      next: (res: any) => {
        this.exchangeRate = res.rate;
        this.rateMessage = res.message;
      },
      error: () => {
        this.rateMessage = 'Live rate unavailable (using fallback)';
      }
    });
  }

  get estimatedInr(): string {
    if (!this.selected || !this.exchangeRate) return '—';
    const inr = this.selected.price * this.quantity * this.exchangeRate;
    return '₹' + inr.toFixed(2);
  }

  proceed() {
    if (!this.selected) {
      alert('Please select a product');
      return;
    }
    if (!this.quantity || this.quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    // FIX: Guard localStorage with isPlatformBrowser()
    // localStorage does not exist in Node.js SSR — this prevents the crash
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('order', JSON.stringify({
        product: this.selected,
        quantity: this.quantity
      }));
    }

    this.router.navigate(['/payment']);
  }
}