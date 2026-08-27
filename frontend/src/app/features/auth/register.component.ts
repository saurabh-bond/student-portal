import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="container" style="max-width: 400px;">
      @if (!needsConfirmation()) {
        <h2>Sign Up</h2>
        @if (errorMessage()) {
          <p style="color: red; margin: 10px 0;">{{ errorMessage() }}</p>
        }
        <form (ngSubmit)="onRegister()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" required />
          </div>
          <div class="form-group">
            <label>Password (Min 8 chars, 1 uppercase, 1 number)</label>
            <input type="password" [(ngModel)]="password" name="password" required />
          </div>
          <div class="form-group">
            <label>Role</label>
            <select [(ngModel)]="role" name="role">
              <option value="Student">Student</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <button type="submit" [disabled]="loading()">Register</button>
        </form>
      } @else {
        <h2>Verify Email</h2>
        <p>Enter the 6-digit confirmation code sent to <strong>{{ email }}</strong></p>
        @if (errorMessage()) {
          <p style="color: red; margin: 10px 0;">{{ errorMessage() }}</p>
        }
        <form (ngSubmit)="onConfirm()">
          <div class="form-group">
            <label>Confirmation Code</label>
            <input type="text" [(ngModel)]="confirmationCode" name="code" required />
          </div>
          <button type="submit" [disabled]="loading()">Verify & Continue</button>
        </form>
      }
    </div>
  `
})
export class RegisterComponent {
  email = '';
  password = '';
  role = 'Student';
  confirmationCode = '';
  needsConfirmation = signal(false);
  loading = signal(false);
  errorMessage = signal('');

  private http = inject(HttpClient);
  private router = inject(Router);

  onRegister(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.http.post<any>(`${environment.apiUrl}/auth/register`, {
      email: this.email,
      password: this.password,
      role: this.role
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.needsConfirmation.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.error || 'Registration failed');
      }
    });
  }

  onConfirm(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.http.post<any>(`${environment.apiUrl}/auth/confirm`, {
      email: this.email,
      code: this.confirmationCode
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.error || 'Verification failed');
      }
    });
  }
}
