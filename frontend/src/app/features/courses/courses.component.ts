import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CourseStore } from '../../store/courses/course.store';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2>Available Courses</h2>
        @if (authService.isAdmin()) {
          <button (click)="showModal.set(!showModal())">
            {{ showModal() ? 'Cancel' : '+ Add New Course' }}
          </button>
        }
      </div>

      @if (showModal()) {
        <div class="card" style="background: #f8fafc; margin-bottom: 20px;">
          <h3>Create Course</h3>
          <form (ngSubmit)="onCreateCourse()">
            <div class="form-group">
              <label>Course Title</label>
              <input [(ngModel)]="newTitle" name="title" required />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="newDescription" name="description" rows="3" required></textarea>
            </div>
            <button type="submit">Publish Course</button>
          </form>
        </div>
      }

      @if (courseStore.loading()) {
        <p>Loading courses...</p>
      }

      @for (course of courseStore.courses(); track course.course_id) {
        <div class="card">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <h3>{{ course.title }}</h3>
              <p style="margin: 8px 0; color: #4b5563;">{{ course.description }}</p>
              <small>Instructor: {{ course.instructor }}</small>
            </div>
            <div>
              @if (!authService.isAdmin()) {
                <button (click)="applyCourse(course)" class="success">Apply for Course</button>
              } @else {
                <button (click)="courseStore.deleteCourse(course.course_id)" class="danger">Delete</button>
              }
            </div>
          </div>
        </div>
      } @empty {
        <p>No courses available right now.</p>
      }
    </div>
  `
})
export class CoursesComponent implements OnInit {
  courseStore = inject(CourseStore);
  authService = inject(AuthService);
  private http = inject(HttpClient);

  showModal = signal(false);
  newTitle = '';
  newDescription = '';

  ngOnInit(): void {
    this.courseStore.loadCourses();
  }

  onCreateCourse(): void {
    this.courseStore.createCourse({
      title: this.newTitle,
      description: this.newDescription
    }, () => {
      this.newTitle = '';
      this.newDescription = '';
      this.showModal.set(false);
    });
  }

  applyCourse(course: any): void {
    this.http.post(`${environment.apiUrl}/enrollments/apply`, {
      course_id: course.course_id,
      course_title: course.title
    }).subscribe({
      next: () => alert('Applied successfully! Waiting for Admin approval.'),
      error: (err) => alert(err.error?.error || 'Enrollment failed')
    });
  }
}
