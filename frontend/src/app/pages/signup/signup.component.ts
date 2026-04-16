import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  username = '';
  email = '';
  password = '';
  role = 'normal';   // Default
  error = '';
  loading = false;
  hidePassword = true; // For password visibility toggle

  constructor(private http: HttpClient, private router: Router) { }

  signup() {
    this.loading = true;
    this.error = '';
    const userData = {
      username: this.username,
      email: this.email,
      password: this.password,
      role: this.role
    };

    this.http.post('http://localhost:8000/auth/signup', userData).subscribe({
      next: (res: any) => {
        console.log('Signup successful', res);
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Signup error', err);
        this.error = err.error?.detail || 'An error occurred during signup';
        this.loading = false;
      }
    });
  }
}
