import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-my-enrollments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h2>My Enrolled Courses</h2>
      <div style="margin-top: 20px;">
        @for (item of enrollments(); track item.enrollment_id) {
          <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3>{{ item.course_title }}</h3>
              <p style="margin-top: 5px;">
                Status: 
                <span class="badge" [ngClass]="item.status.toLowerCase()">{{ item.status }}</span>
              </p>
            </div>
            <button (click)="dropCourse(item.enrollment_id)" class="danger">Drop Course</button>
          </div>
        } @empty {
          <p>You haven't applied for any courses yet.</p>
        }
      </div>
    </div>
  `
})
export class MyEnrollmentsComponent implements OnInit {
  private http = inject(HttpClient);
  enrollments = signal<any[]>([]);

  ngOnInit(): void {
    this.loadEnrollments();
  }

  loadEnrollments(): void {
    this.http.get<{ enrollments: any[] }>(`${environment.apiUrl}/enrollments/my`).subscribe({
      next: (res) => this.enrollments.set(res.enrollments || [])
    });
  }

  dropCourse(enrollmentId: string): void {
    if (!confirm('Are you sure you want to remove yourself from this course?')) return;
    this.http.delete(`${environment.apiUrl}/enrollments/${enrollmentId}`).subscribe({
      next: () => this.loadEnrollments()
    });
  }
}
