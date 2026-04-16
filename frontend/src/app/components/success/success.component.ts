import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { OrderSummaryComponent } from '../../shared/order-summary/order-summary.component';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    OrderSummaryComponent
  ],
  templateUrl: './success.component.html',
  styleUrl: './success.component.css'
})
export class SuccessComponent {
  result: any = null;

  constructor(private router: Router) {
    // Read the result from the router state (passed from PaymentComponent)
    const navigation = this.router.getCurrentNavigation();
    this.result = navigation?.extras?.state?.['result'] || null;

    // Fallback: If not in current navigation, check history.state
    if (!this.result && typeof window !== 'undefined') {
      this.result = window.history.state?.['result'];
    }
  }

  /** Go back to product selection for a new order */
  newOrder() {
    this.router.navigate(['/']);
  }
}