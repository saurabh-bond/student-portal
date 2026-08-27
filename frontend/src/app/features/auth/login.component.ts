import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="container" style="max-width: 400px;">
      <h2>Login</h2>
      @if (errorMessage()) {
        <p style="color: red; margin: 10px 0;">{{ errorMessage() }}</p>
      }
      <form (ngSubmit)="onLogin()">
        <div class="form-group">
          <label>Email</label>
          <input type="email" [(ngModel)]="email" name="email" required />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" [(ngModel)]="password" name="password" required />
        </div>
        <button type="submit" [disabled]="loading()">
          {{ loading() ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      <div style="margin-top: 15px; font-size: 14px;">
        <a routerLink="/auth/forgot-password">Forgot password?</a> | 
        <a routerLink="/auth/register">Create account</a>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  errorMessage = signal('');

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  onLogin(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.http.post<any>(`${environment.apiUrl}/auth/login`, {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.authService.login(res);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.error || 'Login failed');
      }
    });
  }
}
