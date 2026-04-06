import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.services';
import { Router, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { CartService, CartItem } from '../../services/cart.service';
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
    MatIconModule,
    MatProgressSpinnerModule,
    ProductCardComponent,
    RouterModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {

  cartService = inject(CartService);
  router = inject(Router);
  api = inject(ApiService);
  platformId = inject(PLATFORM_ID);

  cartItems: CartItem[] = [];
  rateMessage: string = 'Fetching live rate...';

  ngOnInit() {
    this.cartItems = this.cartService.getItems();
    this.loadExchangeRate();
  }

  loadExchangeRate() {
    this.api.getExchangeRate().subscribe({
      next: (res: any) => {
        this.rateMessage = res.message;
      },
      error: () => {
        this.rateMessage = 'Live rate unavailable (using fallback)';
      }
    });
  }

  deleteItem(productId: number) {
    this.cartService.removeFromCart(productId);
    this.cartItems = this.cartService.getItems(); // Refresh list
  }

  checkoutItem(item: CartItem) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('order', JSON.stringify({
        product: item,
        quantity: item.quantity
      }));
      this.router.navigate(['/payment']);
    }
  }
}

