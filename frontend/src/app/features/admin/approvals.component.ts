import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h2>Pending Student Course Approvals</h2>
      <div style="margin-top: 20px;">
        @for (item of pendingRequests(); track item.enrollment_id) {
          <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3>{{ item.course_title }}</h3>
              <p style="color: #4b5563;">Student Email: {{ item.user_email }}</p>
              <small>User ID: {{ item.user_id }}</small>
            </div>
            <div style="display: flex; gap: 8px;">
              <button (click)="updateStatus(item, 'APPROVED')" class="success">Approve</button>
              <button (click)="updateStatus(item, 'REJECTED')" class="danger">Reject</button>
            </div>
          </div>
        } @empty {
          <p>No pending approvals at this time.</p>
        }
      </div>
    </div>
  `
})
export class ApprovalsComponent implements OnInit {
  private http = inject(HttpClient);
  pendingRequests = signal<any[]>([]);

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending(): void {
    this.http.get<{ pending_approvals: any[] }>(`${environment.apiUrl}/enrollments/pending`).subscribe({
      next: (res) => this.pendingRequests.set(res.pending_approvals || [])
    });
  }

  updateStatus(item: any, status: string): void {
    this.http.put(`${environment.apiUrl}/enrollments/${item.enrollment_id}/status`, {
      user_id: item.user_id,
      status: status
    }).subscribe({
      next: () => this.loadPending()
    });
  }
}
