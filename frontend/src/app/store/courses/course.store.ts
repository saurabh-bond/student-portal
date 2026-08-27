import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Course {
  course_id: string;
  title: string;
  description: string;
  instructor: string;
}

@Injectable({ providedIn: 'root' })
export class CourseStore {
  private http = inject(HttpClient);

  private coursesSignal = signal<Course[]>([]);
  private loadingSignal = signal<boolean>(false);

  readonly courses = computed(() => this.coursesSignal());
  readonly loading = computed(() => this.loadingSignal());

  loadCourses(): void {
    this.loadingSignal.set(true);
    this.http.get<{ courses: Course[] }>(`${environment.apiUrl}/courses`).subscribe({
      next: (res) => {
        this.coursesSignal.set(res.courses || []);
        this.loadingSignal.set(false);
      },
      error: () => this.loadingSignal.set(false)
    });
  }

  createCourse(course: { title: string; description: string; instructor?: string }, onSuccess: () => void): void {
    this.http.post(`${environment.apiUrl}/courses`, course).subscribe({
      next: () => {
        this.loadCourses();
        onSuccess();
      }
    });
  }

  deleteCourse(courseId: string): void {
    this.http.delete(`${environment.apiUrl}/courses/${courseId}`).subscribe({
      next: () => this.loadCourses()
    });
  }
}
