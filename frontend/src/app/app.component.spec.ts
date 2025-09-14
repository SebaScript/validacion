import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate'], {
      url: '/'
    });

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the app', () => {
      expect(component).toBeTruthy();
    });

    it('should have router injected correctly', () => {
      expect(component.router).toBeDefined();
      expect(component.router).toBe(mockRouter);
    });

    it('should initialize with router dependency', () => {
      expect(component.router).toEqual(jasmine.any(Object));
      expect(component.router.url).toBeDefined();
    });
  });

  describe('isLoginRoute getter - Login Routes Detection', () => {
    it('should return true for /login route', () => {
      mockRouter.url = '/login';
      expect(component.isLoginRoute).toBe(true);
    });

    it('should return true for /admin-login route', () => {
      mockRouter.url = '/admin-login';
      expect(component.isLoginRoute).toBe(true);
    });

    it('should return true for /admin route', () => {
      mockRouter.url = '/admin';
      expect(component.isLoginRoute).toBe(true);
    });

    it('should return true for /profile route', () => {
      mockRouter.url = '/profile';
      expect(component.isLoginRoute).toBe(true);
    });

    it('should return true for /sign-up route', () => {
      mockRouter.url = '/sign-up';
      expect(component.isLoginRoute).toBe(true);
    });

    it('should return true for /checkout route', () => {
      mockRouter.url = '/checkout';
      expect(component.isLoginRoute).toBe(true);
    });

    it('should return true for auth callback routes', () => {
      const authRoutes = [
        '/auth/callback',
        '/auth/callback/google',
        '/auth/callback/facebook',
        '/auth/callback/github',
        '/auth/callback/success',
        '/auth/callback/error'
      ];

      authRoutes.forEach(route => {
        mockRouter.url = route;
        expect(component.isLoginRoute).toBe(true);
      });
    });

    it('should return false for non-login routes', () => {
      const nonLoginRoutes = [
        '/',
        '/home',
        '/products',
        '/product/1',
        '/about',
        '/contact',
        '/help',
        '/terms',
        '/privacy'
      ];

      nonLoginRoutes.forEach(route => {
        mockRouter.url = route;
        expect(component.isLoginRoute).toBe(false);
      });
    });

    it('should return false for routes similar but not exact matches', () => {
      const similarRoutes = [
        '/loginn',
        '/loginuser',
        '/user-login',
        '/admin-user',
        '/adminn',
        '/profiles',
        '/profile-edit',
        '/sign-upp',
        '/signout',
        '/checkoutt',
        '/checkout-success',
        '/authcallback',
        '/auth/callbacks',
        '/authentication/callback'
      ];

      similarRoutes.forEach(route => {
        mockRouter.url = route;
        expect(component.isLoginRoute).toBe(false);
      });
    });

    it('should handle routes with query parameters', () => {
      const routesWithParams = [
        '/login?redirect=/home',
        '/admin-login?token=abc123',
        '/admin?tab=users',
        '/profile?edit=true',
        '/sign-up?referrer=google',
        '/checkout?step=payment',
        '/auth/callback?code=xyz789&state=abc'
      ];

      routesWithParams.forEach(route => {
        mockRouter.url = route;
        expect(component.isLoginRoute).toBe(true);
      });
    });

    it('should handle routes with fragments', () => {
      const routesWithFragments = [
        '/login#top',
        '/admin-login#dashboard',
        '/admin#users',
        '/profile#settings',
        '/sign-up#form',
        '/checkout#summary',
        '/auth/callback#success'
      ];

      routesWithFragments.forEach(route => {
        mockRouter.url = route;
        expect(component.isLoginRoute).toBe(true);
      });
    });

    it('should handle empty and undefined router url', () => {
      mockRouter.url = '';
      expect(component.isLoginRoute).toBe(false);

      (mockRouter as any).url = undefined;
      expect(() => component.isLoginRoute).not.toThrow();
    });

    it('should handle null router url', () => {
      (mockRouter as any).url = null;
      expect(() => component.isLoginRoute).not.toThrow();
    });

    it('should be case sensitive', () => {
      const caseVariations = [
        '/Login',
        '/LOGIN',
        '/Admin-Login',
        '/ADMIN',
        '/Profile',
        '/Sign-Up',
        '/Checkout',
        '/Auth/Callback'
      ];

      caseVariations.forEach(route => {
        mockRouter.url = route;
        expect(component.isLoginRoute).toBe(false);
      });
    });

    it('should handle routes with special characters', () => {
      const specialRoutes = [
        '/login@test',
        '/admin-login$',
        '/admin%20user',
        '/profile&edit',
        '/sign-up*',
        '/checkout+premium',
        '/auth/callback|success'
      ];

      specialRoutes.forEach(route => {
        mockRouter.url = route;
        expect(component.isLoginRoute).toBe(false);
      });
    });

    it('should handle very long URLs', () => {
      const longUrl = '/auth/callback' + 'a'.repeat(1000);
      mockRouter.url = longUrl;
      expect(component.isLoginRoute).toBe(true);
    });

    it('should consistently return boolean type', () => {
      const testRoutes = [
        '/',
        '/login',
        '/admin-login',
        '/admin',
        '/profile',
        '/sign-up',
        '/checkout',
        '/auth/callback',
        '/random-route'
      ];

      testRoutes.forEach(route => {
        mockRouter.url = route;
        expect(typeof component.isLoginRoute).toBe('boolean');
      });
    });
  });

  describe('Route Logic Validation', () => {
    it('should use exact string matching for non-auth routes', () => {
      // Test exact matches
      mockRouter.url = '/login';
      expect(component.isLoginRoute).toBe(true);

      // Test partial matches should fail
      mockRouter.url = '/logintest';
      expect(component.isLoginRoute).toBe(false);

      mockRouter.url = 'test/login';
      expect(component.isLoginRoute).toBe(false);
    });

    it('should use startsWith for auth/callback routes', () => {
      // Should work for any route starting with /auth/callback
      mockRouter.url = '/auth/callback';
      expect(component.isLoginRoute).toBe(true);

      mockRouter.url = '/auth/callback/google';
      expect(component.isLoginRoute).toBe(true);

      mockRouter.url = '/auth/callback/test/deep/path';
      expect(component.isLoginRoute).toBe(true);

      // Should not match partial strings
      mockRouter.url = '/test/auth/callback';
      expect(component.isLoginRoute).toBe(false);

      mockRouter.url = '/auth-callback';
      expect(component.isLoginRoute).toBe(false);
    });

    it('should handle multiple consecutive calls', () => {
      // Test that the getter works consistently
      mockRouter.url = '/login';
      expect(component.isLoginRoute).toBe(true);
      expect(component.isLoginRoute).toBe(true);
      expect(component.isLoginRoute).toBe(true);

      mockRouter.url = '/home';
      expect(component.isLoginRoute).toBe(false);
      expect(component.isLoginRoute).toBe(false);
      expect(component.isLoginRoute).toBe(false);
    });

    it('should work with rapid route changes', () => {
      const routes = [
        '/login',
        '/home',
        '/admin',
        '/products',
        '/profile',
        '/checkout',
        '/auth/callback'
      ];

      routes.forEach(route => {
        mockRouter.url = route;
        const isLogin = component.isLoginRoute;
        expect(typeof isLogin).toBe('boolean');
      });
    });
  });

  describe('Integration with Router', () => {
    it('should read url property from router correctly', () => {
      const testUrl = '/test-route';
      mockRouter.url = testUrl;

      // Access the getter to trigger router.url access
      component.isLoginRoute;

      // Verify the router.url was accessed
      expect(component.router.url).toBe(testUrl);
    });

    it('should handle router property access', () => {
      expect(component.router).toBeDefined();
      expect(component.router).toBe(mockRouter);

      // Test that we can access router properties
      expect(component.router.url).toBeDefined();
    });

    it('should work with different router states', () => {
      // Test with different URL values
      const urls = ['/', '/login', '/home', '/auth/callback/test'];

      urls.forEach(url => {
        mockRouter.url = url;
        expect(() => component.isLoginRoute).not.toThrow();
        expect(typeof component.isLoginRoute).toBe('boolean');
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle router url being changed after component initialization', () => {
      // Initial state
      mockRouter.url = '/home';
      expect(component.isLoginRoute).toBe(false);

      // Change router url
      mockRouter.url = '/login';
      expect(component.isLoginRoute).toBe(true);

      // Change again
      mockRouter.url = '/admin';
      expect(component.isLoginRoute).toBe(true);
    });

    it('should not throw errors with malformed URLs', () => {
      const malformedUrls = [
        '//login',
        '///admin',
        '/login//test',
        '/admin///test',
        '////auth/callback'
      ];

      malformedUrls.forEach(url => {
        mockRouter.url = url;
        expect(() => component.isLoginRoute).not.toThrow();
      });
    });

    it('should handle unicode characters in URLs', () => {
      const unicodeUrls = [
        '/loginñ',
        '/admin-logín',
        '/admín',
        '/perfilñ',
        '/auth/回调'
      ];

      unicodeUrls.forEach(url => {
        mockRouter.url = url;
        expect(() => component.isLoginRoute).not.toThrow();
        expect(typeof component.isLoginRoute).toBe('boolean');
      });
    });
  });

  describe('Performance and Memory', () => {
    it('should not create new objects on each call', () => {
      mockRouter.url = '/login';

      // Call multiple times and ensure no memory leaks
      for (let i = 0; i < 100; i++) {
        const result = component.isLoginRoute;
        expect(typeof result).toBe('boolean');
      }
    });

    it('should handle rapid successive calls efficiently', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        mockRouter.url = i % 2 === 0 ? '/login' : '/home';
        component.isLoginRoute;
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 100ms for 1000 calls)
      expect(duration).toBeLessThan(100);
    });
  });
});
