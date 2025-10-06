import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../shared/services/auth.service';
import { OAuthService } from '../../shared/services/oauth.service';
import { User } from '../../shared/interfaces/user.interface';

@Component({
  selector: 'app-auth-callback',
  template: `
    <div class="callback-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Processing authentication...</p>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: var(--background-color);
    }

    .loading-spinner {
      text-align: center;
      color: var(--font-color);
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid var(--hover-color);
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 2s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    p {
      font-family: var(--font-family);
      text-transform: uppercase;
      font-weight: bold;
    }
  `],
  standalone: true
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly oauthService: OAuthService,
    private readonly toastr: ToastrService
  ) {}

  ngOnInit() {
    this.handleCallback();
  }

  private handleCallback() {
    try {
      // Check if user is already authenticated (from new OAuth flow)
      if (this.authService.isAuthenticated()) {
        const user = this.authService.getCurrentUser();
        if (user) {
          this.toastr.success(`Welcome back ${user.name}!`, 'Already Logged In');
          this.navigateBasedOnRole(user);
          return;
        }
      }

      // Try legacy OAuth callback flow
      const { token, user } = this.oauthService.parseCallbackParams();

      if (token && user) {
        const typedUser = user as User;
        // Store the token and user data
        localStorage.setItem('access_token', token);
        localStorage.setItem('currentUser', JSON.stringify(typedUser));

        // Update auth service state
        this.authService.currentUserSubject.next(typedUser);
        this.authService.isUserLogged.set(true);
        this.authService.isAdminLogged.set(typedUser.role === 'admin');

        // Show success message
        this.toastr.success(`Welcome ${typedUser.name}!`, 'Login Successful');

        this.navigateBasedOnRole(typedUser);
      } else {
        // No token or user data, redirect to login with error
        this.toastr.error('Authentication failed - no credentials found', 'Login Error');
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      this.toastr.error('Authentication failed', 'Login Error');
      this.router.navigate(['/login']);
    }
  }

  private navigateBasedOnRole(user: any): void {
    // Navigate based on user role
    if (user.role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/profile']);
    }
  }
}
