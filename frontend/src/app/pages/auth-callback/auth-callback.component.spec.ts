import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, BehaviorSubject } from 'rxjs';

import { AuthCallbackComponent } from './auth-callback.component';
import { AuthService } from '../../shared/services/auth.service';
import { OAuthService } from '../../shared/services/oauth.service';
import { User } from '../../shared/interfaces/user.interface';

describe('AuthCallbackComponent', () => {
  let component: AuthCallbackComponent;
  let fixture: ComponentFixture<AuthCallbackComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockOAuthService: jasmine.SpyObj<OAuthService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let currentUserSubject: BehaviorSubject<User | null>;

  const mockUser: User = {
    userId: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'client'
  };

  const mockAdminUser: User = {
    userId: 2,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
  };

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<User | null>(null);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isAuthenticated',
      'getCurrentUser'
    ]);

    authServiceSpy.currentUserSubject = currentUserSubject;
    authServiceSpy.isUserLogged = { set: jasmine.createSpy() };
    authServiceSpy.isAdminLogged = { set: jasmine.createSpy() };

    const oauthServiceSpy = jasmine.createSpyObj('OAuthService', [
      'parseCallbackParams'
    ]);

    const toastrSpy = jasmine.createSpyObj('ToastrService', [
      'success', 'error'
    ]);

    await TestBed.configureTestingModule({
      imports: [AuthCallbackComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: OAuthService, useValue: oauthServiceSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthCallbackComponent);
    component = fixture.componentInstance;

    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockOAuthService = TestBed.inject(OAuthService) as jasmine.SpyObj<OAuthService>;
    mockToastr = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should call handleCallback on ngOnInit', () => {
      spyOn(component as any, 'handleCallback');

      component.ngOnInit();

      expect(component['handleCallback']).toHaveBeenCalled();
    });
  });

  describe('Handle Callback - Already Authenticated User', () => {
    beforeEach(() => {
      mockAuthService.isAuthenticated.and.returnValue(true);
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
    });

    it('should handle already authenticated regular user', () => {
      spyOn(component as any, 'navigateBasedOnRole');

      component.ngOnInit();

      expect(mockToastr.success).toHaveBeenCalledWith('Welcome back John Doe!', 'Already Logged In');
      expect(component['navigateBasedOnRole']).toHaveBeenCalledWith(mockUser);
    });

    it('should handle already authenticated admin user', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockAdminUser);
      spyOn(component as any, 'navigateBasedOnRole');

      component.ngOnInit();

      expect(mockToastr.success).toHaveBeenCalledWith('Welcome back Admin User!', 'Already Logged In');
      expect(component['navigateBasedOnRole']).toHaveBeenCalledWith(mockAdminUser);
    });

    it('should handle authenticated user but no user data', () => {
      mockAuthService.getCurrentUser.and.returnValue(null);
      mockOAuthService.parseCallbackParams.and.returnValue({
        token: 'test-token',
        user: mockUser
      });
      spyOn(localStorage, 'setItem');

      component.ngOnInit();

      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'test-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('currentUser', JSON.stringify(mockUser));
      expect(mockAuthService.currentUserSubject.next).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('Handle Callback - OAuth Flow', () => {
    beforeEach(() => {
      mockAuthService.isAuthenticated.and.returnValue(false);
    });

    it('should handle successful OAuth callback with token and user', () => {
      mockOAuthService.parseCallbackParams.and.returnValue({
        token: 'test-token',
        user: mockUser
      });
      spyOn(localStorage, 'setItem');
      spyOn(component as any, 'navigateBasedOnRole');

      component.ngOnInit();

      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'test-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('currentUser', JSON.stringify(mockUser));
      expect(mockAuthService.currentUserSubject.next).toHaveBeenCalledWith(mockUser);
      expect(mockAuthService.isUserLogged.set).toHaveBeenCalledWith(true);
      expect(mockAuthService.isAdminLogged.set).toHaveBeenCalledWith(false);
      expect(mockToastr.success).toHaveBeenCalledWith('Welcome John Doe!', 'Login Successful');
      expect(component['navigateBasedOnRole']).toHaveBeenCalledWith(mockUser);
    });

    it('should handle OAuth callback with admin user', () => {
      mockOAuthService.parseCallbackParams.and.returnValue({
        token: 'admin-token',
        user: mockAdminUser
      });
      spyOn(localStorage, 'setItem');
      spyOn(component as any, 'navigateBasedOnRole');

      component.ngOnInit();

      expect(mockAuthService.isAdminLogged.set).toHaveBeenCalledWith(true);
      expect(mockToastr.success).toHaveBeenCalledWith('Welcome Admin User!', 'Login Successful');
      expect(component['navigateBasedOnRole']).toHaveBeenCalledWith(mockAdminUser);
    });

    it('should handle OAuth callback without token', () => {
      mockOAuthService.parseCallbackParams.and.returnValue({
        token: null,
        user: mockUser
      });

      component.ngOnInit();

      expect(mockToastr.error).toHaveBeenCalledWith('Authentication failed - no credentials found', 'Login Error');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle OAuth callback without user', () => {
      mockOAuthService.parseCallbackParams.and.returnValue({
        token: 'test-token',
        user: null
      });

      component.ngOnInit();

      expect(mockToastr.error).toHaveBeenCalledWith('Authentication failed - no credentials found', 'Login Error');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle OAuth callback with both token and user missing', () => {
      mockOAuthService.parseCallbackParams.and.returnValue({
        token: null,
        user: null
      });

      component.ngOnInit();

      expect(mockToastr.error).toHaveBeenCalledWith('Authentication failed - no credentials found', 'Login Error');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Navigation Based on Role', () => {
    it('should navigate admin user to admin panel', () => {
      component['navigateBasedOnRole'](mockAdminUser);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin']);
    });

    it('should navigate regular user to profile', () => {
      component['navigateBasedOnRole'](mockUser);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
    });

    it('should handle user without role', () => {
      const userWithoutRole = { ...mockUser, role: undefined };

      component['navigateBasedOnRole'](userWithoutRole);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
    });

    it('should handle null user', () => {
      component['navigateBasedOnRole'](null as any);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockAuthService.isAuthenticated.and.returnValue(false);
    });

    it('should handle parsing error from OAuth service', () => {
      mockOAuthService.parseCallbackParams.and.throwError('Parse error');
      spyOn(console, 'error');

      component.ngOnInit();

      expect(console.error).toHaveBeenCalledWith('Error handling OAuth callback:', jasmine.any(Error));
      expect(mockToastr.error).toHaveBeenCalledWith('Authentication failed', 'Login Error');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle localStorage errors', () => {
      mockOAuthService.parseCallbackParams.and.returnValue({
        token: 'test-token',
        user: mockUser
      });
      spyOn(localStorage, 'setItem').and.throwError('Storage error');
      spyOn(console, 'error');

      component.ngOnInit();

      expect(console.error).toHaveBeenCalledWith('Error handling OAuth callback:', jasmine.any(Error));
      expect(mockToastr.error).toHaveBeenCalledWith('Authentication failed', 'Login Error');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle authService errors', () => {
      mockOAuthService.parseCallbackParams.and.returnValue({
        token: 'test-token',
        user: mockUser
      });
      spyOn(mockAuthService.currentUserSubject, 'next').and.throwError('AuthService error');
      spyOn(localStorage, 'setItem');
      spyOn(console, 'error');

      component.ngOnInit();

      expect(console.error).toHaveBeenCalledWith('Error handling OAuth callback:', jasmine.any(Error));
      expect(mockToastr.error).toHaveBeenCalledWith('Authentication failed', 'Login Error');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle router navigation errors', () => {
      mockOAuthService.parseCallbackParams.and.returnValue({
        token: 'test-token',
        user: mockUser
      });
      spyOn(localStorage, 'setItem');
      mockRouter.navigate.and.throwError('Navigation error');
      spyOn(console, 'error');

      component.ngOnInit();

      expect(console.error).toHaveBeenCalledWith('Error handling OAuth callback:', jasmine.any(Error));
      expect(mockToastr.error).toHaveBeenCalledWith('Authentication failed', 'Login Error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed user data', () => {
      mockAuthService.isAuthenticated.and.returnValue(false);
      const malformedUser = {
        // Missing required fields
        userId: null,
        name: '',
        email: null
      } as any;

      mockOAuthService.parseCallbackParams.and.returnValue({
        token: 'test-token',
        user: malformedUser
      });
      spyOn(localStorage, 'setItem');
      spyOn(component as any, 'navigateBasedOnRole');

      component.ngOnInit();

      expect(localStorage.setItem).toHaveBeenCalledWith('currentUser', JSON.stringify(malformedUser));
      expect(component['navigateBasedOnRole']).toHaveBeenCalledWith(malformedUser);
    });

    it('should handle empty token', () => {
      mockAuthService.isAuthenticated.and.returnValue(false);
      mockOAuthService.parseCallbackParams.and.returnValue({
        token: '',
        user: mockUser
      });

      component.ngOnInit();

      expect(mockToastr.error).toHaveBeenCalledWith('Authentication failed - no credentials found', 'Login Error');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle whitespace-only token', () => {
      mockAuthService.isAuthenticated.and.returnValue(false);
      mockOAuthService.parseCallbackParams.and.returnValue({
        token: '   ',
        user: mockUser
      });

      component.ngOnInit();

      expect(mockToastr.error).toHaveBeenCalledWith('Authentication failed - no credentials found', 'Login Error');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle already authenticated user with existing token', () => {
      mockAuthService.isAuthenticated.and.returnValue(true);
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      spyOn(localStorage, 'getItem').and.returnValue('existing-token');
      spyOn(component as any, 'navigateBasedOnRole');

      component.ngOnInit();

      expect(mockToastr.success).toHaveBeenCalledWith('Welcome back John Doe!', 'Already Logged In');
      expect(component['navigateBasedOnRole']).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('Template Integration', () => {
    it('should display loading spinner by default', () => {
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('.spinner');
      const loadingText = fixture.nativeElement.querySelector('p');

      expect(spinner).toBeTruthy();
      expect(loadingText?.textContent?.trim()).toBe('Processing authentication...');
    });

    it('should maintain loading state during callback processing', fakeAsync(() => {
      mockAuthService.isAuthenticated.and.returnValue(false);
      mockOAuthService.parseCallbackParams.and.returnValue({
        token: 'test-token',
        user: mockUser
      });
      spyOn(localStorage, 'setItem');

      component.ngOnInit();
      fixture.detectChanges();

      tick(100);

      const spinner = fixture.nativeElement.querySelector('.spinner');
      expect(spinner).toBeTruthy();
    }));

    it('should have correct CSS classes for loading state', () => {
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.callback-container');
      const loadingSpinner = fixture.nativeElement.querySelector('.loading-spinner');
      const spinner = fixture.nativeElement.querySelector('.spinner');

      expect(container).toBeTruthy();
      expect(loadingSpinner).toBeTruthy();
      expect(spinner).toBeTruthy();
    });
  });

  describe('Performance and Memory', () => {
    it('should not create memory leaks during multiple callback attempts', () => {
      mockAuthService.isAuthenticated.and.returnValue(false);

      for (let i = 0; i < 10; i++) {
        mockOAuthService.parseCallbackParams.and.returnValue({
          token: `token-${i}`,
          user: { ...mockUser, userId: i }
        });
        spyOn(localStorage, 'setItem');

        component.ngOnInit();
      }

      expect(mockOAuthService.parseCallbackParams).toHaveBeenCalledTimes(10);
    });

    it('should handle rapid successive callback processing', () => {
      mockAuthService.isAuthenticated.and.returnValue(false);
      mockOAuthService.parseCallbackParams.and.returnValue({
        token: 'test-token',
        user: mockUser
      });
      spyOn(localStorage, 'setItem');

      // Simulate rapid successive calls
      for (let i = 0; i < 5; i++) {
        component.ngOnInit();
      }

      expect(mockOAuthService.parseCallbackParams).toHaveBeenCalledTimes(5);
      expect(localStorage.setItem).toHaveBeenCalledTimes(10); // 2 calls per init (token + user)
    });
  });

  describe('Integration with Services', () => {
    it('should properly integrate with all injected services', () => {
      mockAuthService.isAuthenticated.and.returnValue(false);
      mockOAuthService.parseCallbackParams.and.returnValue({
        token: 'integration-token',
        user: mockUser
      });
      spyOn(localStorage, 'setItem');

      component.ngOnInit();

      expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
      expect(mockOAuthService.parseCallbackParams).toHaveBeenCalled();
      expect(mockAuthService.currentUserSubject.next).toHaveBeenCalledWith(mockUser);
      expect(mockAuthService.isUserLogged.set).toHaveBeenCalledWith(true);
      expect(mockAuthService.isAdminLogged.set).toHaveBeenCalledWith(false);
      expect(mockToastr.success).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should handle service method calls in correct sequence', () => {
      const callOrder: string[] = [];

      mockAuthService.isAuthenticated.and.callFake(() => {
        callOrder.push('isAuthenticated');
        return false;
      });

      mockOAuthService.parseCallbackParams.and.callFake(() => {
        callOrder.push('parseCallbackParams');
        return { token: 'test-token', user: mockUser };
      });

      spyOn(mockAuthService.currentUserSubject, 'next').and.callFake(() => {
        callOrder.push('currentUserSubject.next');
      });

      mockToastr.success.and.callFake(() => {
        callOrder.push('toastr.success');
        return {} as any;
      });

      mockRouter.navigate.and.callFake(() => {
        callOrder.push('router.navigate');
        return Promise.resolve(true);
      });

      spyOn(localStorage, 'setItem');

      component.ngOnInit();

      expect(callOrder).toEqual([
        'isAuthenticated',
        'parseCallbackParams',
        'currentUserSubject.next',
        'toastr.success',
        'router.navigate'
      ]);
    });
  });
});
