// src/app/shared/order-summary/order-summary.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

export interface OrderSummary {
  product: {
    name: string;
    price: number;   // USD
  };
  quantity: number;
  totalUsd: number;   // calculated
  totalInr: number;   // calculated
  rate: number | null;       // live rate
  paymentId?: string; // optional – shown on success page
}

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css',
})
export class OrderSummaryComponent {
  @Input() data!: OrderSummary;
}
