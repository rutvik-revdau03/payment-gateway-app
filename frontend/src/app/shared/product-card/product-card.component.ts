// src/app/shared/product-card/product-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Product {
  id: number;
  name: string;
  price: number;          // USD
  image?: string;        // optional thumbnail url
  description?: string;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  /** Product data supplied by the parent */
  @Input() product!: Product;

  /** Quantity selected by the user – defaults to 1 */
  @Input() quantity = 1;

  /** Emit when the user clicks the “Add / Update” button */
  @Output() addToCart = new EventEmitter<number>();

  /** Simple helper – price × quantity */
  get totalUsd(): number {
    return +(this.product.price * this.quantity).toFixed(2);
  }

  /** Called by the button */
  onAdd() {
    this.addToCart.emit(this.quantity);
  }
}
