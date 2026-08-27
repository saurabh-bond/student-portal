import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'courses', pathMatch: 'full' },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./features/auth/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'courses',
    loadComponent: () => import('./features/courses/courses.component').then(m => m.CoursesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'student/enrollments',
    loadComponent: () => import('./features/student/my-enrollments.component').then(m => m.MyEnrollmentsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/approvals',
    loadComponent: () => import('./features/admin/approvals.component').then(m => m.ApprovalsComponent),
    canActivate: [authGuard]
  }
];
