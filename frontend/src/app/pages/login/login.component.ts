import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../shared/services/auth.service';
import { OAuthService } from '../../shared/services/oauth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  isGoogleLoading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly oauthService: OAuthService,
    private readonly router: Router,
    private readonly toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;

      this.authService.login({ email, password }).subscribe({
        next: (success) => {
          this.isLoading = false;
          if (success) {
            const user = this.authService.getCurrentUser();
            if (user?.role === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/profile']);
            }
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login error:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
      this.showValidationErrors();
    }
  }

  async signInWithGoogle() {
    try {
      this.isGoogleLoading = true;
      await this.oauthService.signInWithGoogle();
    } catch (error) {
      this.isGoogleLoading = false;
      console.error('Google sign-in error:', error);
      this.toastr.error('Google sign-in failed', 'Authentication Error');
    }
  }

  private showValidationErrors(): void {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.invalid) {
      if (emailControl.errors?.['required']) {
        this.toastr.error('Email is required', 'Validation Error');
        return;
      }
      if (emailControl.errors?.['email']) {
        this.toastr.error('Please enter a valid email address', 'Validation Error');
        return;
      }
    }

    const passwordControl = this.loginForm.get('password');
    if (passwordControl?.invalid) {
      if (passwordControl.errors?.['required']) {
        this.toastr.error('Password is required', 'Validation Error');
        return;
      }
      if (passwordControl.errors?.['minlength']) {
        this.toastr.error('Password must be at least 6 characters', 'Validation Error');
        return;
      }
    }

    // Generic fallback message
    this.toastr.error('Please fill in all required fields correctly', 'Validation Error');
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
