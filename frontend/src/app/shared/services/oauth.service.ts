import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LocalUserService } from './local-user.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    google: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class OAuthService {
  private readonly GOOGLE_CLIENT_ID = environment.oauth?.google?.clientId || '';

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly localUserService: LocalUserService,
    private readonly toastr: ToastrService
  ) { }

  // Initialize Google OAuth
  initializeGoogleSignIn(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.google) {
        resolve();
        return;
      }

      // Load Google APIs script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Initialize Google Sign-In
        if (window.google && this.GOOGLE_CLIENT_ID) {
          window.google.accounts.id.initialize({
            client_id: this.GOOGLE_CLIENT_ID,
            callback: this.handleGoogleResponse.bind(this)
          });
        }
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load Google Sign-In script'));
      };
      document.head.appendChild(script);
    });
  }

  // Handle Google Sign-In
  async signInWithGoogle(): Promise<void> {
    try {
      if (!this.GOOGLE_CLIENT_ID) {
        this.toastr.warning('Google OAuth is not configured. Using demo mode.', 'Demo Mode');
        await this.handleDemoGoogleLogin();
        return;
      }

      await this.initializeGoogleSignIn();

      // Trigger Google One Tap or popup
      if (window.google) {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to popup
            this.showGooglePopup();
          }
        });
      }
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    }
  }

  // Show Google popup as fallback
  private showGooglePopup(): void {
    if (window.google) {
      window.google.accounts.id.renderButton(
        document.getElementById('g_id_signin') || document.body,
        { theme: 'outline', size: 'large' }
      );
    }
  }

  // Handle Google OAuth response
  private async handleGoogleResponse(response: any): Promise<void> {
    try {
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      // Decode JWT token (basic decode for demo - in production use proper JWT library)
      const payload = this.decodeJWT(response.credential);

      const googleUser = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      };

      await this.authenticateOrCreateUser(googleUser);
    } catch (error) {
      console.error('Error handling Google response:', error);
      this.toastr.error('Google authentication failed', 'Authentication Error');
    }
  }

  // Demo mode for Google login (when no client ID is configured)
  private async handleDemoGoogleLogin(): Promise<void> {
    const demoUser = {
      email: 'demo.google@vallmere.com',
      name: 'Google Demo User',
      picture: ''
    };

    await this.authenticateOrCreateUser(demoUser);
  }

  // Authenticate or create user with Google data
  private async authenticateOrCreateUser(googleUser: any): Promise<void> {
    try {
      // Try to find existing user
      let user = this.localUserService.findUserByEmail(googleUser.email);

      if (!user) {
        // Create new user
        const newUserData = {
          name: googleUser.name,
          email: googleUser.email,
          password: this.generateRandomPassword(), // Random password for OAuth users
          role: 'client' as const
        };

        user = await this.localUserService.createUser(newUserData);
        this.toastr.success('Account created successfully!', 'Welcome');
      }

      // Generate local token and authenticate
      const token = 'local_token_' + Date.now();
      localStorage.setItem('access_token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));

      // Update auth service state
      this.authService.currentUserSubject.next(user);
      this.authService.isUserLogged.set(true);
      this.authService.isAdminLogged.set(user.role === 'admin');

      this.toastr.success(`Welcome ${user.name}!`, 'Login Successful');

      // Navigate based on user role
      if (user.role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/profile']);
      }
    } catch (error: any) {
      console.error('Error authenticating Google user:', error);
      this.toastr.error(error.message || 'Authentication failed', 'Authentication Error');
    }
  }

  // Simple JWT decoder (for demo purposes - use proper JWT library in production)
  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error al analizar la carga útil de JWT", error);
      throw new Error('Token JWT no válido: no se pudo decodificar la carga útil JSON.');
    }
  }

  // Generate random password for OAuth users
  private generateRandomPassword(): string {
    return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
  }

  // Parse OAuth callback parameters (legacy support)
  parseCallbackParams(): { token: string | null, user: unknown } {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');

    let user: unknown = null;
    if (userParam) {
      try {
        user = JSON.parse(decodeURIComponent(userParam));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    return { token, user };
  }

  // Check if user is authenticated via OAuth
  isOAuthAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!(this.authService.getCurrentUser()?.userId && token?.startsWith('local_token_'));
  }

  // Clear OAuth session
  clearOAuthSession(): void {
    this.authService.clearAuthData();
  }
}
