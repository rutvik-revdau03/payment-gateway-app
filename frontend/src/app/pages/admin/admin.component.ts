import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiService } from '../../services/api.services';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatCardModule, 
    MatButtonModule, 
    MatInputModule, 
    MatIconModule, 
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTabsModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  api = inject(ApiService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  selectedTabIndex = 0;
  isDedicatedPage = false;

  product = {
    name: '',
    price: 0,
    stock_quantity: 0
  };

  loading = false;
  successMessage: string = '';
  errorMessage: string = '';
  myProducts: any[] = [];
  salesHistory: any[] = [];
  notifications: any[] = [];

  ngOnInit() {
    this.loadMyProducts();
    this.loadSalesHistory();
    this.loadNotifications();

    // Handle route data (for /admin/sales and /admin/notifications routes)
    this.route.data.subscribe(data => {
      if (data['tab']) {
        this.selectedTabIndex = data['tab'];
        this.isDedicatedPage = true;
      }
    });

    // Support query params too
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.selectedTabIndex = Number(params['tab']);
      }
    });
  }

  loadMyProducts() {
    const id = this.getAdminId();
    if (id) this.api.getProducts(id).subscribe(res => this.myProducts = res);
  }

  loadSalesHistory() {
    const id = this.getAdminId();
    if (id) this.api.getAdminTransactions(id).subscribe(res => this.salesHistory = res);
  }

  loadNotifications() {
    const id = this.getAdminId();
    if (id) this.api.getNotifications(id).subscribe(res => this.notifications = res);
  }

  getAdminId(): number {
    if (typeof window === 'undefined') return 0;
    const userId = localStorage.getItem('userId');
    return userId ? Number(userId) : 0;
  }

  onSubmit() {
    if (!this.product.name || this.product.price <= 0) {
      this.errorMessage = 'Please provide a valid name and price.';
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Typing for the data object
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : { id: 1 }; // Default to 1 if not found

    const data = {
        name: this.product.name,
        price: Number(this.product.price),
        stock_quantity: Number(this.product.stock_quantity),
        admin_id: user.id
    };

    // We need to add a postProducts method to ApiService if it doesn't exist
    // But since I'm creating this on the fly, I'll use a direct call if I can
    // Or I'll update ApiService first.
    
    this.api.addProduct(data).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.successMessage = `Successfully added ${res.stock_quantity} units of "${res.name}"!`;
        this.product = { name: '', price: 0, stock_quantity: 0 };
        this.loadMyProducts();
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.detail || 'Failed to add product.';
      }
    });
  }

  updateStock(p: any, newStock: string) {
    p.stock_quantity = Number(newStock);
    this.api.updateProduct(p.id, p).subscribe(() => {
      alert('Stock updated successfully!');
      this.loadMyProducts();
    });
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to remove this product from your inventory?')) {
        this.api.deleteProduct(id).subscribe(() => {
            this.loadMyProducts();
            alert('Product removed.');
        });
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
