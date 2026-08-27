import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="container" style="max-width: 400px;">
      @if (step() === 1) {
        <h2>Reset Password</h2>
        <p>We'll email you a recovery code.</p>
        <form (ngSubmit)="sendCode()">
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="email" name="email" required />
          </div>
          <button type="submit" [disabled]="loading()">Send Recovery Code</button>
        </form>
      } @else {
        <h2>Enter Code & New Password</h2>
        <form (ngSubmit)="resetPassword()">
          <div class="form-group">
            <label>Recovery Code</label>
            <input type="text" [(ngModel)]="code" name="code" required />
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input type="password" [(ngModel)]="newPassword" name="newPassword" required />
          </div>
          <button type="submit" [disabled]="loading()">Confirm New Password</button>
        </form>
      }
      @if (errorMessage()) {
        <p style="color: red; margin-top: 10px;">{{ errorMessage() }}</p>
      }
    </div>
  `
})
export class ForgotPasswordComponent {
  email = '';
  code = '';
  newPassword = '';
  step = signal(1);
  loading = signal(false);
  errorMessage = signal('');

  private http = inject(HttpClient);
  private router = inject(Router);

  sendCode(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email: this.email }).subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set(2);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.error || 'Failed to send recovery code');
      }
    });
  }

  resetPassword(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.http.post(`${environment.apiUrl}/auth/confirm-forgot-password`, {
      email: this.email,
      code: this.code,
      new_password: this.newPassword
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.error || 'Password reset failed');
      }
    });
  }
}
