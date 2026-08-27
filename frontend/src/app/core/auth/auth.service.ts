import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface UserSession {
  email: string;
  sub: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private idTokenSignal = signal<string | null>(localStorage.getItem('id_token'));
  private sessionSignal = signal<UserSession | null>(this.decodeToken(localStorage.getItem('id_token')));

  readonly isAuthenticated = computed(() => !!this.idTokenSignal());
  readonly user = computed(() => this.sessionSignal());
  readonly isAdmin = computed(() => this.sessionSignal()?.roles.includes('Admin') ?? false);

  private decodeToken(token: string | null): UserSession | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      let roles: string[] = [];
      const rawGroups = payload['cognito:groups'];
      if (Array.isArray(rawGroups)) {
        roles = rawGroups;
      } else if (typeof rawGroups === 'string') {
        roles = [rawGroups];
      }
      return {
        email: payload.email,
        sub: payload.sub,
        roles
      };
    } catch {
      return null;
    }
  }

  getIdToken(): string | null {
    return this.idTokenSignal();
  }

  login(tokens: { id_token: string, access_token: string }): void {
    localStorage.setItem('id_token', tokens.id_token);
    localStorage.setItem('access_token', tokens.access_token);
    this.idTokenSignal.set(tokens.id_token);
    this.sessionSignal.set(this.decodeToken(tokens.id_token));
    this.router.navigate(['/courses']);
  }

  logout(): void {
    localStorage.clear();
    this.idTokenSignal.set(null);
    this.sessionSignal.set(null);
    this.router.navigate(['/auth/login']);
  }
}
