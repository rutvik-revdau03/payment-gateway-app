import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.services';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private api = inject(ApiService);
  private cartItemsSubject = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  constructor() {
    this.refreshCart();
  }

  private getUserId(): number {
    if (typeof window === 'undefined') return 0;
    const userId = localStorage.getItem('userId');
    return userId ? Number(userId) : 0;
  }

  refreshCart() {
    const userId = this.getUserId();
    if (userId) {
      this.api.getCart(userId).subscribe(items => this.cartItemsSubject.next(items));
    }
  }

  addToCart(product: any) {
    const userId = this.getUserId();
    if (!userId) {
        alert('Please login first');
        return;
    }

    this.api.addToCart({ user_id: userId, product_id: product.id, quantity: 1 }).subscribe({
      next: (res: any) => {
        if (res.error === 'OUT_OF_STOCK') {
          if (confirm(`${res.message} Would you like to be notified?`)) {
            this.api.notifyMe(userId, product.id).subscribe(() => alert('Admin notified. We will update you!'));
          }
        } else {
          this.refreshCart();
          alert(`🛒 Reserving stock... ${product.name} added!`);
        }
      },
      error: () => alert('Error adding to cart.')
    });
  }

  removeFromCart(cartItemId: number) {
    this.api.removeFromCart(cartItemId).subscribe(() => {
      this.refreshCart();
      alert('Item removed. Stock released back to shop.');
    });
  }

  get cartItemsValue() {
    return this.cartItemsSubject.value;
  }

  get totalItems() {
    return this.cartItemsSubject.value.length;
  }

  getItems() {
    return this.cartItemsSubject.value;
  }
}
