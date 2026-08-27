import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="nav-bar">
      <h2>Student Portal</h2>
      <div>
        @if (authService.isAuthenticated()) {
          <a routerLink="/courses" routerLinkActive="active">All Courses</a>
          <a routerLink="/student/enrollments" routerLinkActive="active">My Enrollments</a>
          @if (authService.isAdmin()) {
            <a routerLink="/admin/approvals" routerLinkActive="active">Pending Approvals</a>
          }
          <button (click)="authService.logout()" style="margin-left: 1.5rem;" class="danger">Logout</button>
        } @else {
          <a routerLink="/auth/login" routerLinkActive="active">Login</a>
          <a routerLink="/auth/register" routerLinkActive="active">Register</a>
        }
      </div>
    </nav>
    <main>
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent {
  authService = inject(AuthService);
}
