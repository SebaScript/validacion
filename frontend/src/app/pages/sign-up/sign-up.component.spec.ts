import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { SignUpComponent } from './sign-up.component';
import { AuthService } from '../../shared/services/auth.service';
import { OAuthService } from '../../shared/services/oauth.service';

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockOAuthService: jasmine.SpyObj<OAuthService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    const oauthServiceSpy = jasmine.createSpyObj('OAuthService', ['signInWithGoogle']);
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [SignUpComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: OAuthService, useValue: oauthServiceSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;

    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockOAuthService = TestBed.inject(OAuthService) as jasmine.SpyObj<OAuthService>;
    mockToastr = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;

    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.submitted).toBe(false);
      expect(component.isLoading).toBe(false);
      expect(component.isGoogleLoading).toBe(false);
    });

    it('should initialize form with validators', () => {
      expect(component.signUpForm).toBeDefined();
      expect(component.signUpForm.get('name')?.hasError('required')).toBe(true);
      expect(component.signUpForm.get('email')?.hasError('required')).toBe(true);
      expect(component.signUpForm.get('password')?.hasError('required')).toBe(true);
      expect(component.signUpForm.get('rePassword')?.hasError('required')).toBe(true);
      expect(component.signUpForm.valid).toBe(false);
    });

    it('should inject dependencies correctly', () => {
      expect(component['router']).toBe(mockRouter);
      expect(component['authService']).toBe(mockAuthService);
      expect(component['oauthService']).toBe(mockOAuthService);
      expect(component['toastr']).toBe(mockToastr);
    });
  });

  describe('Form Validation', () => {
    it('should validate name field', () => {
      const nameControl = component.signUpForm.get('name');

      // Test required validation
      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBe(true);

      // Test minlength validation
      nameControl?.setValue('ab');
      expect(nameControl?.hasError('minlength')).toBe(true);

      // Test valid name
      nameControl?.setValue('John Doe');
      expect(nameControl?.valid).toBe(true);
    });

    it('should validate email field', () => {
      const emailControl = component.signUpForm.get('email');

      // Test required validation
      emailControl?.setValue('');
      expect(emailControl?.hasError('required')).toBe(true);

      // Test invalid email format
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);

      // Test valid email
      emailControl?.setValue('user@example.com');
      expect(emailControl?.valid).toBe(true);
    });

    it('should validate password field', () => {
      const passwordControl = component.signUpForm.get('password');

      // Test required validation
      passwordControl?.setValue('');
      expect(passwordControl?.hasError('required')).toBe(true);

      // Test minlength validation
      passwordControl?.setValue('123');
      expect(passwordControl?.hasError('minlength')).toBe(true);

      // Test valid password
      passwordControl?.setValue('password123');
      expect(passwordControl?.valid).toBe(true);
    });

    it('should validate password confirmation', () => {
      component.signUpForm.patchValue({
        password: 'password123',
        rePassword: 'different'
      });

      expect(component.signUpForm.hasError('passwordMismatch')).toBe(true);

      component.signUpForm.patchValue({
        password: 'password123',
        rePassword: 'password123'
      });

      expect(component.signUpForm.hasError('passwordMismatch')).toBe(false);
    });

    it('should validate entire form', () => {
      expect(component.signUpForm.valid).toBe(false);

      component.signUpForm.patchValue({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        rePassword: 'password123'
      });

      expect(component.signUpForm.valid).toBe(true);
    });
  });

  describe('Sign Up Process', () => {
    beforeEach(() => {
      component.signUpForm.patchValue({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        rePassword: 'password123'
      });
    });

    it('should not submit if form is invalid', () => {
      component.signUpForm.patchValue({
        name: '', // Invalid
        email: 'john@example.com',
        password: 'password123',
        rePassword: 'password123'
      });

      component.onSignUp();

      expect(component.submitted).toBe(true);
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should submit valid form and handle successful registration', fakeAsync(() => {
      mockAuthService.register.and.returnValue(of(true));

      component.onSignUp();
      tick();

      expect(component.isLoading).toBe(false);
      expect(mockAuthService.register).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'client'
      });
      expect(mockToastr.success).toHaveBeenCalledWith('Account created successfully! Welcome!', 'Registration Successful');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
    }));

    it('should handle registration failure', fakeAsync(() => {
      mockAuthService.register.and.returnValue(of(false));

      component.onSignUp();
      tick();

      expect(component.isLoading).toBe(false);
      expect(mockToastr.error).toHaveBeenCalledWith('Registration failed. Please try again.', 'Registration Error');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));

    it('should handle registration error', fakeAsync(() => {
      const error = new Error('Network error');
      mockAuthService.register.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.onSignUp();
      tick();

      expect(component.isLoading).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Registration error:', error);
      expect(mockToastr.error).toHaveBeenCalledWith('Registration failed. Please try again.', 'Registration Error');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));

    it('should set loading state during registration process', () => {
      mockAuthService.register.and.returnValue(of(true));

      expect(component.isLoading).toBe(false);

      component.onSignUp();

      expect(component.isLoading).toBe(true);
    });

    it('should show validation errors for invalid form', () => {
      spyOn(component as any, 'showValidationErrors');
      component.signUpForm.patchValue({
        name: '',
        email: 'invalid-email',
        password: '123',
        rePassword: 'different'
      });

      component.onSignUp();

      expect(component['showValidationErrors']).toHaveBeenCalled();
      expect(component.submitted).toBe(true);
    });
  });

  describe('Google Sign Up', () => {
    it('should handle successful Google sign up', fakeAsync(() => {
      mockOAuthService.signInWithGoogle.and.returnValue(Promise.resolve());

      component.signUpWithGoogle();
      tick();

      expect(component.isGoogleLoading).toBe(false);
      expect(mockOAuthService.signInWithGoogle).toHaveBeenCalled();
    }));

    it('should handle Google sign up error', fakeAsync(() => {
      const error = new Error('Google auth error');
      mockOAuthService.signInWithGoogle.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');

      component.signUpWithGoogle();
      tick();

      expect(component.isGoogleLoading).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Google sign up error:', error);
      expect(mockToastr.error).toHaveBeenCalledWith('Google sign up failed. Please try again.', 'Authentication Error');
    }));

    it('should set loading state during Google sign up', async () => {
      mockOAuthService.signInWithGoogle.and.returnValue(new Promise(() => {})); // Never resolves

      expect(component.isGoogleLoading).toBe(false);

      component.signUpWithGoogle();

      expect(component.isGoogleLoading).toBe(true);
    });
  });

  describe('Form Controls Getters', () => {
    it('should return name control', () => {
      const nameControl = component.signUpForm.get('name');
      expect(component.name).toBe(nameControl);
    });

    it('should return email control', () => {
      const emailControl = component.signUpForm.get('email');
      expect(component.email).toBe(emailControl);
    });

    it('should return password control', () => {
      const passwordControl = component.signUpForm.get('password');
      expect(component.password).toBe(passwordControl);
    });

    it('should return rePassword control', () => {
      const rePasswordControl = component.signUpForm.get('rePassword');
      expect(component.rePassword).toBe(rePasswordControl);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle form control validation state changes', () => {
      const nameControl = component.signUpForm.get('name');

      nameControl?.setValue('ab');
      nameControl?.markAsTouched();

      expect(nameControl?.invalid && nameControl?.touched).toBe(true);

      nameControl?.setValue('Valid Name');

      expect(nameControl?.valid).toBe(true);
    });

    it('should handle password mismatch validation', () => {
      component.signUpForm.patchValue({
        password: 'password123',
        rePassword: 'different123'
      });

      // Trigger validation
      component.signUpForm.updateValueAndValidity();

      expect(component.signUpForm.hasError('passwordMismatch')).toBe(true);
    });

    it('should handle empty form submission', () => {
      component.signUpForm.reset();

      component.onSignUp();

      expect(component.submitted).toBe(true);
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should handle multiple validation errors', () => {
      component.signUpForm.patchValue({
        name: 'a', // Too short
        email: 'invalid', // Invalid email
        password: '12', // Too short
        rePassword: '34' // Doesn't match
      });

      component.onSignUp();

      expect(component.submitted).toBe(true);
      expect(component.signUpForm.invalid).toBe(true);
    });

    it('should reset form validation state on valid input', () => {
      // Set invalid state first
      component.signUpForm.patchValue({
        name: '',
        email: 'invalid'
      });
      component.onSignUp();
      expect(component.submitted).toBe(true);

      // Now set valid values
      component.signUpForm.patchValue({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        rePassword: 'password123'
      });

      mockAuthService.register.and.returnValue(of(true));
      component.onSignUp();

      expect(mockAuthService.register).toHaveBeenCalled();
    });
  });

  describe('Password Validation Custom Validator', () => {
    it('should return null for matching passwords', () => {
      const formGroup = component['fb'].group({
        password: 'test123',
        rePassword: 'test123'
      });

      const result = component['passwordsMatch'](formGroup);
      expect(result).toBeNull();
    });

    it('should return error for mismatched passwords', () => {
      const formGroup = component['fb'].group({
        password: 'test123',
        rePassword: 'different'
      });

      const result = component['passwordsMatch'](formGroup);
      expect(result).toEqual({ passwordMismatch: true });
    });

    it('should handle null values in password controls', () => {
      const formGroup = component['fb'].group({
        password: null,
        rePassword: null
      });

      const result = component['passwordsMatch'](formGroup);
      expect(result).toBeNull();
    });

    it('should handle one null password control', () => {
      const formGroup = component['fb'].group({
        password: 'test123',
        rePassword: null
      });

      const result = component['passwordsMatch'](formGroup);
      expect(result).toEqual({ passwordMismatch: true });
    });
  });

  describe('Integration with AuthService', () => {
    it('should call register with correct parameters', () => {
      const formData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'mypassword123',
        rePassword: 'mypassword123'
      };

      component.signUpForm.patchValue(formData);
      mockAuthService.register.and.returnValue(of(true));

      component.onSignUp();

      expect(mockAuthService.register).toHaveBeenCalledWith({
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'mypassword123',
        role: 'client'
      });
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
    });

    it('should handle delayed AuthService response', fakeAsync(() => {
      let resolveRegistration: (value: boolean) => void;
      const registrationPromise = new Promise<boolean>(resolve => {
        resolveRegistration = resolve;
      });

      mockAuthService.register.and.returnValue(registrationPromise as any);

      component.signUpForm.patchValue({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        rePassword: 'password123'
      });

      component.onSignUp();
      expect(component.isLoading).toBe(true);

      tick(50);
      expect(component.isLoading).toBe(true);

      resolveRegistration!(true);
      tick();

      expect(component.isLoading).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
    }));
  });

  describe('Template Integration', () => {
    it('should disable submit button when form is invalid', () => {
      component.signUpForm.patchValue({
        name: '',
        email: 'john@example.com',
        password: 'password123',
        rePassword: 'password123'
      });

      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton?.disabled).toBe(true);
    });

    it('should disable submit button when loading', () => {
      component.signUpForm.patchValue({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        rePassword: 'password123'
      });
      component.isLoading = true;

      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton?.disabled).toBe(true);
    });

    it('should enable submit button when form is valid and not loading', () => {
      component.signUpForm.patchValue({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        rePassword: 'password123'
      });
      component.isLoading = false;

      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton?.disabled).toBe(false);
    });

    it('should display loading state in submit button', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const loadingIcon = fixture.nativeElement.querySelector('.spinning');
      const loadingText = fixture.nativeElement.querySelector('button[type="submit"] span');

      expect(loadingIcon).toBeTruthy();
      expect(loadingText?.textContent?.trim()).toBe('Creating account...');
    });

    it('should display loading state in Google button', () => {
      component.isGoogleLoading = true;
      fixture.detectChanges();

      const googleButton = fixture.nativeElement.querySelector('.google-oauth-btn');
      expect(googleButton?.disabled).toBe(true);
    });
  });

  describe('Performance and Memory', () => {
    it('should not create memory leaks with multiple sign up attempts', () => {
      const attempts = 5;

      for (let i = 0; i < attempts; i++) {
        mockAuthService.register.and.returnValue(of(false));
        component.onSignUp();
      }

      expect(mockAuthService.register).toHaveBeenCalledTimes(attempts);
    });

    it('should handle rapid successive sign up attempts', fakeAsync(() => {
      component.signUpForm.patchValue({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        rePassword: 'password123'
      });

      // Simulate rapid clicks
      for (let i = 0; i < 3; i++) {
        mockAuthService.register.and.returnValue(of(true));
        component.onSignUp();
      }

      tick();

      // Should still work correctly
      expect(component.isLoading).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
    }));
  });
});
