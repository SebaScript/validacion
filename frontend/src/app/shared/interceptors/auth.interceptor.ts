import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Get the token from localStorage
    const token = localStorage.getItem('access_token');

    // Clone the request and add the authorization header if token exists
    let authReq = req;
    if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Handle the request and catch any auth errors
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Only logout if this is NOT a login or register request
          // Login/register failures should be handled by the respective services
          if (!req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
            // Token is invalid or expired, logout user silently
            this.authService.clearAuthData();
            this.router.navigate(['/login']);
          }
        }
        return throwError(() => error);
      })
    );
  }
}
