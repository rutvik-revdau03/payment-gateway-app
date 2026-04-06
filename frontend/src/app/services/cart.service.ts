import { Injectable } from '@angular/core';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  icon: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: CartItem[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cart');
      if (stored) {
        this.items = JSON.parse(stored);
      }
    }
  }

  getItems() {
    return this.items;
  }

  addToCart(product: any) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }
    this.save();
  }

  clearCart() {
    this.items = [];
    this.save();
  }

  private save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(this.items));
    }
  }

  removeFromCart(productId: number) {
    this.items = this.items.filter(i => i.id !== productId);
    this.save();
  }

  get totalItems() {
    return this.items.reduce((acc, item) => acc + item.quantity, 0);
  }
}
