import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../shared/services/auth.service';
import { OAuthService } from '../../shared/services/oauth.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let oauthServiceSpy: jasmine.SpyObj<OAuthService>;

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl'], {
      events: of({}),
      url: '/test',
      routerState: { root: {} }
    });
    routerSpy.createUrlTree.and.returnValue({} as any);
    routerSpy.serializeUrl.and.returnValue('/test');
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { params: {}, queryParams: {} },
      params: of({}),
      queryParams: of({})
    });
    toastrSpy = jasmine.createSpyObj('ToastrService', ['error']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'getCurrentUser']);
    oauthServiceSpy = jasmine.createSpyObj('OAuthService', ['signInWithGoogle']);

    TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: OAuthService, useValue: oauthServiceSpy }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have email and password getters', () => {
    expect(component.email).toBeDefined();
    expect(component.password).toBeDefined();
  });

  it('should show required email error when form is invalid', () => {
    component.loginForm.setValue({ email: '', password: '' });
    component.onLogin();
    expect(toastrSpy.error).toHaveBeenCalledWith('Email is required', 'Validation Error');
  });

  it('should show invalid email format error', () => {
    component.loginForm.setValue({ email: 'invalid-email', password: '123456' });
    component.onLogin();
    expect(toastrSpy.error).toHaveBeenCalledWith('Please enter a valid email address', 'Validation Error');
  });

  it('should show password minlength error', () => {
    component.loginForm.setValue({ email: 'user@test.com', password: '123' });
    component.onLogin();
    expect(toastrSpy.error).toHaveBeenCalledWith('Password must be at least 6 characters', 'Validation Error');
  });

  it('should login successfully and navigate to /profile for normal user', () => {
    component.loginForm.setValue({ email: 'user@test.com', password: '123456' });
    authServiceSpy.login.and.returnValue(of(true));
    authServiceSpy.getCurrentUser.and.returnValue({ role: 'user' } as any);

    component.onLogin();

    expect(authServiceSpy.login).toHaveBeenCalledWith({ email: 'user@test.com', password: '123456' });
    expect(component.isLoading).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should set isLoading during login flow', () => {
    component.loginForm.setValue({ email: 'user@test.com', password: '123456' });
    authServiceSpy.login.and.callFake(() => {
      // Check the loading flag is set right after triggering login
      expect(component.isLoading).toBeTrue();
      return of(true);
    });
    authServiceSpy.getCurrentUser.and.returnValue({ role: 'user' } as any);

    component.onLogin();
    expect(component.isLoading).toBeFalse();
  });

  it('should handle login error and stop loading', () => {
    spyOn(console, 'error');
    component.loginForm.setValue({ email: 'user@test.com', password: '123456' });
    authServiceSpy.login.and.returnValue(throwError(() => new Error('fail')));

    component.onLogin();

    expect(component.isLoading).toBeFalse();
    expect(console.error).toHaveBeenCalled();
  });

  it('should set isGoogleLoading true on successful Google sign-in', waitForAsync(async () => {
    oauthServiceSpy.signInWithGoogle.and.returnValue(Promise.resolve());

    await component.signInWithGoogle();

    expect(component.isGoogleLoading).toBeTrue();
  }));

  it('should handle Google sign-in failure and show toast', fakeAsync(() => {
    oauthServiceSpy.signInWithGoogle.and.returnValue(Promise.reject('error'));

    component.signInWithGoogle();
    flushMicrotasks();

    expect(component.isGoogleLoading).toBeFalse();
    expect(toastrSpy.error).toHaveBeenCalledWith('Google sign-in failed', 'Authentication Error');
  }));

  it('should navigate to admin when user role is admin', () => {
    component.loginForm.setValue({ email: 'admin@test.com', password: '123456' });
    authServiceSpy.login.and.returnValue(of(true));
    authServiceSpy.getCurrentUser.and.returnValue({ role: 'admin' } as any);

    component.onLogin();

    expect(authServiceSpy.login).toHaveBeenCalledWith({ email: 'admin@test.com', password: '123456' });
    expect(component.isLoading).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should show password required error', () => {
    component.loginForm.setValue({ email: 'user@test.com', password: '' });
    component.onLogin();
    expect(toastrSpy.error).toHaveBeenCalledWith('Password is required', 'Validation Error');
  });

  it('should show generic validation error when no specific error matches', () => {
    // Create a form with invalid state that doesn't match specific validators
    component.loginForm.setValue({ email: 'user@test.com', password: '123456' });
    component.loginForm.get('email')?.setErrors({ customError: true });
    component.loginForm.get('password')?.setErrors({ customError: true });
    
    component.onLogin();
    expect(toastrSpy.error).toHaveBeenCalledWith('Please fill in all required fields correctly', 'Validation Error');
  });

  it('should mark all form controls as touched when form is invalid', () => {
    const markAsTouchedSpy = spyOn(component.loginForm.get('email')!, 'markAsTouched');
    const markAsTouchedPasswordSpy = spyOn(component.loginForm.get('password')!, 'markAsTouched');
    
    component.loginForm.setValue({ email: '', password: '' });
    component.onLogin();
    
    expect(markAsTouchedSpy).toHaveBeenCalled();
    expect(markAsTouchedPasswordSpy).toHaveBeenCalled();
  });

  it('should handle login success but getCurrentUser returns null', () => {
    component.loginForm.setValue({ email: 'user@test.com', password: '123456' });
    authServiceSpy.login.and.returnValue(of(true));
    authServiceSpy.getCurrentUser.and.returnValue(null);

    component.onLogin();

    expect(authServiceSpy.login).toHaveBeenCalledWith({ email: 'user@test.com', password: '123456' });
    expect(component.isLoading).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should handle login success but getCurrentUser returns undefined', () => {
    component.loginForm.setValue({ email: 'user@test.com', password: '123456' });
    authServiceSpy.login.and.returnValue(of(true));
    authServiceSpy.getCurrentUser.and.returnValue(undefined as any);

    component.onLogin();

    expect(authServiceSpy.login).toHaveBeenCalledWith({ email: 'user@test.com', password: '123456' });
    expect(component.isLoading).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/profile']);
  });
});
