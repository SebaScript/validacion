import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { AdminLoginComponent } from './admin-login.component';
import { AuthService } from '../../shared/services/auth.service';

describe('AdminLoginComponent', () => {
  let component: AdminLoginComponent;
  let fixture: ComponentFixture<AdminLoginComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['adminLogin']);
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['error', 'success']);

    await TestBed.configureTestingModule({
      imports: [AdminLoginComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLoginComponent);
    component = fixture.componentInstance;

    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockToastr = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;

    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.loading).toBe(false);
      expect(component.error).toBeNull();
    });

    it('should initialize login form with validators', () => {
      expect(component.loginForm).toBeDefined();
      expect(component.loginForm.get('email')?.hasError('required')).toBe(true);
      expect(component.loginForm.get('password')?.hasError('required')).toBe(true);
      expect(component.loginForm.valid).toBe(false);
    });

    it('should inject dependencies correctly', () => {
      expect(component.router).toBe(mockRouter);
      expect(component.authService).toBe(mockAuthService);
      expect(component.toastr).toBe(mockToastr);
    });
  });

  describe('Form Validation', () => {
    it('should validate email field', () => {
      const emailControl = component.loginForm.get('email');

      // Test required validation
      emailControl?.setValue('');
      expect(emailControl?.hasError('required')).toBe(true);

      // Test invalid email format
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);

      // Test valid email
      emailControl?.setValue('admin@example.com');
      expect(emailControl?.valid).toBe(true);
    });

    it('should validate password field', () => {
      const passwordControl = component.loginForm.get('password');

      // Test required validation
      passwordControl?.setValue('');
      expect(passwordControl?.hasError('required')).toBe(true);

      // Test valid password
      passwordControl?.setValue('password123');
      expect(passwordControl?.valid).toBe(true);
    });

    it('should validate entire form', () => {
      expect(component.loginForm.valid).toBe(false);

      component.loginForm.patchValue({
        email: 'admin@example.com',
        password: 'password123'
      });

      expect(component.loginForm.valid).toBe(true);
    });
  });

  describe('Login Process', () => {
    beforeEach(() => {
      component.loginForm.patchValue({
        email: 'admin@example.com',
        password: 'password123'
      });
    });

    it('should not submit if form is invalid', () => {
      component.loginForm.patchValue({
        email: '', // Invalid
        password: 'password123'
      });

      component.onLogin();

      expect(mockAuthService.adminLogin).not.toHaveBeenCalled();
      expect(mockToastr.error).toHaveBeenCalledWith('Please fill all fields correctly', 'Invalid Form');
    });

    it('should submit valid form and handle successful login', fakeAsync(() => {
      mockAuthService.adminLogin.and.returnValue(of(true));

      component.onLogin();
      tick();

      expect(component.loading).toBe(false);
      expect(mockAuthService.adminLogin).toHaveBeenCalledWith('admin@example.com', 'password123');
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('admin');
      expect(component.error).toBeNull();
    }));

    it('should handle login failure', fakeAsync(() => {
      mockAuthService.adminLogin.and.returnValue(of(false));

      component.onLogin();
      tick();

      expect(component.loading).toBe(false);
      expect(component.error).toBe('Invalid credentials or not an admin account');
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    }));

    it('should handle login error', fakeAsync(() => {
      const error = new Error('Network error');
      mockAuthService.adminLogin.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.onLogin();
      tick();

      expect(component.loading).toBe(false);
      expect(component.error).toBe('Login failed. Please try again.');
      expect(console.error).toHaveBeenCalledWith('Login error', error);
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    }));

    it('should set loading state during login process', () => {
      mockAuthService.adminLogin.and.returnValue(of(true));

      expect(component.loading).toBe(false);

      component.onLogin();

      expect(component.loading).toBe(true);
    });

    it('should reset error state on new login attempt', () => {
      component.error = 'Previous error';
      mockAuthService.adminLogin.and.returnValue(of(true));

      component.onLogin();

      expect(component.error).toBeNull();
    });
  });

  describe('Form Controls Getters', () => {
    it('should return email control', () => {
      const emailControl = component.loginForm.get('email');
      expect(component.loginForm.get('email')).toBe(emailControl);
    });

    it('should return password control', () => {
      const passwordControl = component.loginForm.get('password');
      expect(component.loginForm.get('password')).toBe(passwordControl);
    });
  });

  describe('Component State Management', () => {
    it('should handle multiple login attempts', fakeAsync(() => {
      // First attempt - failure
      mockAuthService.adminLogin.and.returnValue(of(false));
      component.onLogin();
      tick();

      expect(component.error).toBe('Invalid credentials or not an admin account');
      expect(component.loading).toBe(false);

      // Second attempt - success
      mockAuthService.adminLogin.and.returnValue(of(true));
      component.onLogin();
      tick();

      expect(component.error).toBeNull();
      expect(component.loading).toBe(false);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('admin');
    }));

    it('should clear error when form becomes valid after being invalid', () => {
      component.error = 'Some error';

      component.loginForm.patchValue({
        email: 'admin@example.com',
        password: 'password123'
      });

      mockAuthService.adminLogin.and.returnValue(of(true));
      component.onLogin();

      expect(component.error).toBeNull();
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle null response from auth service', fakeAsync(() => {
      mockAuthService.adminLogin.and.returnValue(of(null as any));

      component.loginForm.patchValue({
        email: 'admin@example.com',
        password: 'password123'
      });

      component.onLogin();
      tick();

      expect(component.error).toBe('Invalid credentials or not an admin account');
    }));

    it('should handle undefined response from auth service', fakeAsync(() => {
      mockAuthService.adminLogin.and.returnValue(of(undefined as any));

      component.loginForm.patchValue({
        email: 'admin@example.com',
        password: 'password123'
      });

      component.onLogin();
      tick();

      expect(component.error).toBe('Invalid credentials or not an admin account');
    }));

    it('should handle empty email and password', () => {
      component.loginForm.patchValue({
        email: '',
        password: ''
      });

      component.onLogin();

      expect(mockToastr.error).toHaveBeenCalledWith('Please fill all fields correctly', 'Invalid Form');
      expect(mockAuthService.adminLogin).not.toHaveBeenCalled();
    });

    it('should handle whitespace-only input', () => {
      component.loginForm.patchValue({
        email: '   ',
        password: '   '
      });

      component.onLogin();

      expect(mockToastr.error).toHaveBeenCalledWith('Please fill all fields correctly', 'Invalid Form');
      expect(mockAuthService.adminLogin).not.toHaveBeenCalled();
    });
  });

  describe('Integration with AuthService', () => {
    it('should call adminLogin with correct parameters', () => {
      const email = 'test@admin.com';
      const password = 'testpassword';

      component.loginForm.patchValue({ email, password });
      mockAuthService.adminLogin.and.returnValue(of(true));

      component.onLogin();

      expect(mockAuthService.adminLogin).toHaveBeenCalledWith(email, password);
      expect(mockAuthService.adminLogin).toHaveBeenCalledTimes(1);
    });

    it('should handle service returning observable with delayed response', fakeAsync(() => {
      let resolveLogin: (value: boolean) => void;
      const loginPromise = new Promise<boolean>(resolve => {
        resolveLogin = resolve;
      });

      mockAuthService.adminLogin.and.returnValue(new Promise(resolve => {
        setTimeout(() => resolve(loginPromise), 100);
      }) as any);

      component.loginForm.patchValue({
        email: 'admin@example.com',
        password: 'password123'
      });

      component.onLogin();
      expect(component.loading).toBe(true);

      tick(50);
      expect(component.loading).toBe(true);

      resolveLogin!(true);
      tick(100);

      expect(component.loading).toBe(false);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('admin');
    }));
  });

  describe('Form Field Validation Messages', () => {
    it('should show error when email is touched and invalid', () => {
      const emailControl = component.loginForm.get('email');

      emailControl?.setValue('');
      emailControl?.markAsTouched();

      expect(emailControl?.invalid && emailControl?.touched).toBe(true);
    });

    it('should show error when password is touched and invalid', () => {
      const passwordControl = component.loginForm.get('password');

      passwordControl?.setValue('');
      passwordControl?.markAsTouched();

      expect(passwordControl?.invalid && passwordControl?.touched).toBe(true);
    });

    it('should not show error when fields are untouched', () => {
      const emailControl = component.loginForm.get('email');
      const passwordControl = component.loginForm.get('password');

      emailControl?.setValue('');
      passwordControl?.setValue('');

      expect(emailControl?.invalid && emailControl?.touched).toBe(false);
      expect(passwordControl?.invalid && passwordControl?.touched).toBe(false);
    });
  });

  describe('Template Integration', () => {
    it('should disable submit button when form is invalid', () => {
      component.loginForm.patchValue({
        email: '',
        password: 'password123'
      });

      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton?.disabled).toBe(true);
    });

    it('should disable submit button when loading', () => {
      component.loginForm.patchValue({
        email: 'admin@example.com',
        password: 'password123'
      });
      component.loading = true;

      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton?.disabled).toBe(true);
    });

    it('should enable submit button when form is valid and not loading', () => {
      component.loginForm.patchValue({
        email: 'admin@example.com',
        password: 'password123'
      });
      component.loading = false;

      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton?.disabled).toBe(false);
    });

    it('should display loading state in button', () => {
      component.loading = true;
      fixture.detectChanges();

      const loadingIcon = fixture.nativeElement.querySelector('.spinning');
      const loadingText = fixture.nativeElement.querySelector('button[type="submit"] span');

      expect(loadingIcon).toBeTruthy();
      expect(loadingText?.textContent?.trim()).toBe('Signing in...');
    });

    it('should display normal state in button', () => {
      component.loading = false;
      fixture.detectChanges();

      const normalIcon = fixture.nativeElement.querySelector('button[type="submit"] .material-icons:not(.spinning)');
      const normalText = fixture.nativeElement.querySelector('button[type="submit"] span');

      expect(normalIcon).toBeTruthy();
      expect(normalText?.textContent?.trim()).toBe('Access Dashboard');
    });
  });

  describe('Performance and Memory', () => {
    it('should not create memory leaks with multiple login attempts', () => {
      const attempts = 10;

      for (let i = 0; i < attempts; i++) {
        mockAuthService.adminLogin.and.returnValue(of(false));
        component.onLogin();
      }

      expect(component.error).toBe('Invalid credentials or not an admin account');
      expect(mockAuthService.adminLogin).toHaveBeenCalledTimes(attempts);
    });

    it('should handle rapid successive login attempts', fakeAsync(() => {
      component.loginForm.patchValue({
        email: 'admin@example.com',
        password: 'password123'
      });

      // Simulate rapid clicks
      for (let i = 0; i < 5; i++) {
        mockAuthService.adminLogin.and.returnValue(of(true));
        component.onLogin();
      }

      tick();

      // Should still work correctly
      expect(component.loading).toBe(false);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('admin');
    }));
  });
});
