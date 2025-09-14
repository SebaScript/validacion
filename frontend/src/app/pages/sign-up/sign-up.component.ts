// sign-up.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RegisterRequest } from '../../shared/interfaces/user.interface';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import { OAuthService } from '../../shared/services/oauth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent implements OnInit {
  signUpForm!: FormGroup;
  submitted = false;
  isLoading = false;
  isGoogleLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private oauthService: OAuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rePassword: ['', Validators.required],
    }, { validators: this.passwordsMatch });
  }

  private passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const repass = group.get('rePassword')?.value;
    return pass === repass ? null : { passwordsNotMatch: true };
  }

  get f() {
    return this.signUpForm.controls;
  }

  onSignUp(): void {
    this.submitted = true;
    // Form validation in progress

    if (this.signUpForm.invalid) {
      // Form is invalid, showing errors
      this.markFormGroupTouched();
      this.showValidationErrors();
      return;
    }

    this.isLoading = true;

    const registerData: RegisterRequest = {
      name: this.f['name'].value.trim(),
      email: this.f['email'].value.trim().toLowerCase(),
      password: this.f['password'].value,
      role: 'client' // Default role
    };

    this.authService.register(registerData).subscribe({
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
        // Log error for debugging in development only
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          console.error('Registration error:', error);
        }
      }
    });
  }

  async signUpWithGoogle() {
    try {
      this.isGoogleLoading = true;
      await this.oauthService.signInWithGoogle();
    } catch (error) {
      this.isGoogleLoading = false;
      // Log error for debugging in development only
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.error('Google sign-up error:', error);
      }
      this.toastr.error('Google sign-up failed', 'Authentication Error');
    }
  }

  private showValidationErrors(): void {
    // Showing validation errors

    // Check for password mismatch first (form-level error)
    if (this.signUpForm.errors?.['passwordsNotMatch']) {
      // Password mismatch error detected
      this.toastr.error('Passwords do not match', 'Validation Error');
      return;
    }

    // Check individual field errors
    const fieldValidations = [
      { control: 'name', messages: { required: 'Name is required', minlength: 'Name must be at least 3 characters' } },
      { control: 'email', messages: { required: 'Email is required', email: 'Please enter a valid email address' } },
      { control: 'password', messages: { required: 'Password is required', minlength: 'Password must be at least 6 characters' } },
      { control: 'rePassword', messages: { required: 'Please repeat your password' } }
    ];

    for (const field of fieldValidations) {
      const control = this.signUpForm.get(field.control);
      if (control?.invalid) {
        // Field control validation failed
        const errorType = this.getFirstErrorType(control.errors);
        if (errorType && field.messages[errorType]) {
          this.toastr.error(field.messages[errorType], 'Validation Error');
          return;
        }
      }
    }

    // Generic fallback message
    // Showing generic error message
    this.toastr.error('Please fill in all required fields correctly', 'Validation Error');
  }

  private getFirstErrorType(errors: any): string | null {
    if (!errors) return null;
    return Object.keys(errors)[0] || null;
  }

  private markFormGroupTouched() {
    Object.keys(this.signUpForm.controls).forEach(key => {
      const control = this.signUpForm.get(key);
      control?.markAsTouched();
    });
  }

  get name() {
    return this.signUpForm.get('name');
  }

  get email() {
    return this.signUpForm.get('email');
  }

  get password() {
    return this.signUpForm.get('password');
  }

  get rePassword() {
    return this.signUpForm.get('rePassword');
  }
}
