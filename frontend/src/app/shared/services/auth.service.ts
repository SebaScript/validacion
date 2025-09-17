import { Injectable, signal } from '@angular/core';
import { User, LoginRequest, RegisterRequest } from '../interfaces/user.interface';
import { ToastrService } from 'ngx-toastr';
import { LocalUserService } from './local-user.service';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError, from } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAdminLogged = signal(false);
  isUserLogged = signal(false);

  public currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private readonly localUserService: LocalUserService,
    private readonly router: Router,
    private readonly toastr: ToastrService
  ) {
    // Check if we have a stored token and user
    this.checkLocalStorage();
  }

  private checkLocalStorage() {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('currentUser');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
        this.isUserLogged.set(true);
        this.isAdminLogged.set(user.role === 'admin');
      } catch (error) {
        console.error('Error parsing user data from localStorage', error);
        this.clearAuthData();
      }
    }
  }

  // Public method for clearing auth data (used by guards and logout)
  clearAuthData() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAdminLogged.set(false);
    this.isUserLogged.set(false);
  }

  login(loginData: LoginRequest): Observable<boolean> {
    return from(this.localUserService.authenticateUser(loginData.email, loginData.password))
      .pipe(
        map(user => {
          if (user) {
            // Generate a simple token for consistency
            const token = 'local_token_' + Date.now();

            // Store token and user data
            localStorage.setItem('access_token', token);
            localStorage.setItem('currentUser', JSON.stringify(user));

            this.currentUserSubject.next(user);
            this.isUserLogged.set(true);
            this.isAdminLogged.set(user.role === 'admin');

            this.toastr.success('Welcome back!', 'Login Successful');
            return true;
          } else {
            this.toastr.error('Invalid credentials', 'Login Failed');
            return false;
          }
        }),
        catchError(error => {
          console.error('Login error:', error);
          this.toastr.error(error.message || 'Invalid credentials', 'Login Failed');
          return of(false);
        })
      );
  }

  register(registerData: RegisterRequest): Observable<boolean> {
    return from(this.localUserService.createUser(registerData))
      .pipe(
        map(user => {
          if (user) {
            // Generate a simple token for consistency
            const token = 'local_token_' + Date.now();

            // Store token and user data
            localStorage.setItem('access_token', token);
            localStorage.setItem('currentUser', JSON.stringify(user));

            this.currentUserSubject.next(user);
            this.isUserLogged.set(true);
            this.isAdminLogged.set(user.role === 'admin');

            this.toastr.success('Account created successfully!', 'Registration Successful');
            return true;
          }
          return false;
        }),
        catchError(error => {
          console.error('Registration error:', error);
          this.toastr.error(error.message || 'User registration failed', 'Registration Failed');
          return of(false);
        })
      );
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
    this.toastr.success('You have been logged out', 'Logged Out');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    const user = this.currentUserSubject.value;
    return !!(token && user);
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.role === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Get current user profile from localStorage
  getProfile(): Observable<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      this.logout();
      return throwError(() => new Error('No authenticated user'));
    }

    const user = this.localUserService.findUserById(currentUser.userId);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      return of(user);
    } else {
      this.logout();
      return throwError(() => new Error('User not found'));
    }
  }

  // Update user profile
  updateProfile(userData: Partial<User>): Observable<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return throwError(() => new Error('No authenticated user'));
    }

    return from(this.localUserService.updateUser(currentUser.userId, userData)).pipe(
      tap(user => {
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.toastr.success('Profile updated successfully!', 'Update Successful');
        }
      }),
      catchError(error => {
        console.error('Error updating profile:', error);
        this.toastr.error(error.message || 'Failed to update profile', 'Update Failed');
        return throwError(() => error);
      })
    );
  }

  // Legacy methods for backward compatibility
  adminLogin(email: string, password: string): Observable<boolean> {
    return this.login({ email, password });
  }

  userLogin(email: string, password: string): Observable<boolean> {
    return this.login({ email, password });
  }
}
