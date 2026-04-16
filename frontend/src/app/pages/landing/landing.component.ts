import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CartService } from '../../services/cart.service';
import { ApiService } from '../../services/api.services';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit {

  router = inject(Router);
  cartService = inject(CartService);

  api = inject(ApiService);
  
  products: any[] = [];
  loading = false;

  notifications: any[] = [];

  ngOnInit(): void {
    this.loadProducts();
    this.loadNotifications();
  }

  loadProducts() {
    this.loading = true;
    this.api.getProducts().subscribe({
      next: (res: any) => {
        // Map DB products to include icons and descriptions for the UI
        this.products = res.map((p: any, index: number) => {
          let icon = 'inventory_2';
          let description = 'High-quality electronics product for your daily needs.';
          let name = p.name.toLowerCase();
          
          if (name.includes('mobile') || name.includes('phone') || name.includes('iphone')) {
            icon = 'smartphone';
            description = 'Latest high-performance smartphone with edge-to-edge display.';
          } else if (name.includes('tablet') || name.includes('ipad')) {
            icon = 'tablet_android';
            description = 'Powerful tablet with high-resolution screen for productivity.';
          } else if (name.includes('laptop') || name.includes('macbook') || name.includes('computer')) {
            icon = 'laptop';
            description = 'Slim and powerful laptop featuring an 8-core processor.';
          } else if (name.includes('ipod') || name.includes('music')) {
            icon = 'music_note';
            description = 'Classic portable music player with high-fidelity audio.';
          } else if (name.includes('earpod') || name.includes('airpod') || name.includes('buds')) {
            icon = 'earbuds';
            description = 'Crystal clear wireless audio for an immersive listening experience.';
          } else if (name.includes('headphone') || name.includes('headset')) {
            icon = 'headphones';
            description = 'Professional grade noise-canceling headphones for audiophiles.';
          } else if (name.includes('watch') || name.includes('wearable')) {
            icon = 'watch';
            description = 'Stay connected with our latest smart wearable technology.';
          } else if (name.includes('camera') || name.includes('dslr')) {
            icon = 'photo_camera';
            description = 'Capture life moments in stunning detail with our advanced lenses.';
          } else if (name.includes('speaker') || name.includes('audio')) {
            icon = 'speaker';
            description = 'Fill your room with rich, powerful sound and deep bass.';
          }
          
          let isLarge = index === 3; // Keep the 4th product featured for UI variety
          return { ...p, icon, description, isLarge };
        });
        this.loading = false;
      },
      error: () => {
        console.error('Failed to load products from DB');
        this.loading = false;
      }
    });
  }

  isLoggedIn(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user') !== null;
    }
    return false;
  }

  getUserName() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user');
    }
    return 'Guest';
  }

  isAdmin(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('role') === 'admin';
    }
    return false;
  }

  loadNotifications() {
    const userId = this.getUserId();
    if (userId) {
      this.api.getNotifications(userId).subscribe(notifs => this.notifications = notifs);
    }
  }

  private getUserId(): number {
    if (typeof window === 'undefined') return 0;
    const userId = localStorage.getItem('userId');
    return userId ? Number(userId) : 0;
  }

  handleAction(product: any) {
    if (this.isLoggedIn()) {
      this.cartService.addToCart(product);
    } else {
      alert('⚠️ Authentication Required: You must be logged in to add products to your cart.');
      this.router.navigate(['/login']);
    }
  }
}
