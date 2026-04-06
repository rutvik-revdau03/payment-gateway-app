import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../services/api.services';
import { Router } from '@angular/router';

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
    MatProgressSpinnerModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  api = inject(ApiService);
  router = inject(Router);

  product = {
    name: '',
    price: 0
  };

  loading = false;
  successMessage = '';
  errorMessage = '';

  onSubmit() {
    if (!this.product.name || this.product.price <= 0) {
      this.errorMessage = 'Please provide a valid name and price.';
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Typing for the data object
    const data = {
        name: this.product.name,
        price: Number(this.product.price)
    };

    // We need to add a postProducts method to ApiService if it doesn't exist
    // But since I'm creating this on the fly, I'll use a direct call if I can
    // Or I'll update ApiService first.
    
    this.api.addProduct(data).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.successMessage = `Product "${res.name}" added successfully!`;
        this.product = { name: '', price: 0 };
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = 'Failed to add product. Please try again.';
        console.error(err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
