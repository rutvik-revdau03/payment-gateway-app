import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;
  hidePassword = true; // For password visibility toggle

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    this.loading = true;
    this.error = '';
    
    this.http.post('http://localhost:8000/auth/login', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', res.username);
          localStorage.setItem('userId', res.id);
          localStorage.setItem('role', res.role);  // Store role (admin/normal)
          this.router.navigate(['/']);
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.detail || 'Invalid username or password';
        this.loading = false;
      }
    });
  }
}
