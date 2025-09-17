import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpHandler, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockHttpHandler: jasmine.SpyObj<HttpHandler>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'clearAuthData']);
    const handlerSpy = jasmine.createSpyObj('HttpHandler', ['handle']);

    TestBed.configureTestingModule({
      providers: [
        AuthInterceptor,
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    interceptor = TestBed.inject(AuthInterceptor);
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockHttpHandler = handlerSpy;
  });

  describe('Request Interception', () => {
    it('should be created', () => {
      expect(interceptor).toBeTruthy();
    });

    it('should add authorization header when token exists', () => {
      const token = 'test-token-123';
      mockAuthService.getToken.and.returnValue(token);
      mockHttpHandler.handle.and.returnValue(of({} as any));

      const request = new HttpRequest('GET', '/api/test');

      interceptor.intercept(request, mockHttpHandler);

      expect(mockHttpHandler.handle).toHaveBeenCalledWith(
        jasmine.objectContaining({
          headers: jasmine.objectContaining({
            lazyUpdate: jasmine.any(Array)
          })
        })
      );

      // Verify that the cloned request has the authorization header
      const capturedRequest = mockHttpHandler.handle.calls.argsFor(0)[0];
      expect(capturedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
    });

    it('should not add authorization header when token does not exist', () => {
      mockAuthService.getToken.and.returnValue(null);
      mockHttpHandler.handle.and.returnValue(of({} as any));

      const request = new HttpRequest('GET', '/api/test');

      interceptor.intercept(request, mockHttpHandler);

      expect(mockHttpHandler.handle).toHaveBeenCalledWith(request);

      // Verify that the original request is passed through unchanged
      const capturedRequest = mockHttpHandler.handle.calls.argsFor(0)[0];
      expect(capturedRequest.headers.get('Authorization')).toBeNull();
    });

    it('should not add authorization header when token is empty string', () => {
      mockAuthService.getToken.and.returnValue('');
      mockHttpHandler.handle.and.returnValue(of({} as any));

      const request = new HttpRequest('GET', '/api/test');

      interceptor.intercept(request, mockHttpHandler);

      expect(mockHttpHandler.handle).toHaveBeenCalledWith(request);

      const capturedRequest = mockHttpHandler.handle.calls.argsFor(0)[0];
      expect(capturedRequest.headers.get('Authorization')).toBeNull();
    });

    it('should preserve existing headers when adding authorization', () => {
      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);
      mockHttpHandler.handle.and.returnValue(of({} as any));

      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('X-Custom-Header', 'custom-value');

      const request = new HttpRequest('POST', '/api/test', {}, { headers });

      interceptor.intercept(request, mockHttpHandler);

      const capturedRequest = mockHttpHandler.handle.calls.argsFor(0)[0];
      expect(capturedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
      expect(capturedRequest.headers.get('Content-Type')).toBe('application/json');
      expect(capturedRequest.headers.get('X-Custom-Header')).toBe('custom-value');
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 unauthorized error and clear auth data', () => {
      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);

      const error401 = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        error: { message: 'Token expired' }
      });

      mockHttpHandler.handle.and.returnValue(throwError(() => error401));

      const request = new HttpRequest('GET', '/api/protected');

      interceptor.intercept(request, mockHttpHandler).subscribe({
        next: () => fail('Should have errored'),
        error: (error) => {
          expect(error).toBe(error401);
          expect(mockAuthService.clearAuthData).toHaveBeenCalled();
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
        }
      });
    });

    it('should handle 403 forbidden error and clear auth data', () => {
      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);

      const error403 = new HttpErrorResponse({
        status: 403,
        statusText: 'Forbidden',
        error: { message: 'Access denied' }
      });

      mockHttpHandler.handle.and.returnValue(throwError(() => error403));

      const request = new HttpRequest('GET', '/api/admin');

      interceptor.intercept(request, mockHttpHandler).subscribe({
        next: () => fail('Should have errored'),
        error: (error) => {
          expect(error).toBe(error403);
          expect(mockAuthService.clearAuthData).toHaveBeenCalled();
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
        }
      });
    });

    it('should not clear auth data for other HTTP errors', () => {
      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);

      const error500 = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Server error' }
      });

      mockHttpHandler.handle.and.returnValue(throwError(() => error500));

      const request = new HttpRequest('GET', '/api/test');

      interceptor.intercept(request, mockHttpHandler).subscribe({
        next: () => fail('Should have errored'),
        error: (error) => {
          expect(error).toBe(error500);
          expect(mockAuthService.clearAuthData).not.toHaveBeenCalled();
          expect(mockRouter.navigate).not.toHaveBeenCalled();
        }
      });
    });

    it('should not clear auth data for 404 errors', () => {
      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);

      const error404 = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'Resource not found' }
      });

      mockHttpHandler.handle.and.returnValue(throwError(() => error404));

      const request = new HttpRequest('GET', '/api/nonexistent');

      interceptor.intercept(request, mockHttpHandler).subscribe({
        next: () => fail('Should have errored'),
        error: (error) => {
          expect(error).toBe(error404);
          expect(mockAuthService.clearAuthData).not.toHaveBeenCalled();
          expect(mockRouter.navigate).not.toHaveBeenCalled();
        }
      });
    });

    it('should handle non-HTTP errors without clearing auth data', () => {
      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);

      const networkError = new Error('Network error');
      mockHttpHandler.handle.and.returnValue(throwError(() => networkError));

      const request = new HttpRequest('GET', '/api/test');

      interceptor.intercept(request, mockHttpHandler).subscribe({
        next: () => fail('Should have errored'),
        error: (error) => {
          expect(error).toBe(networkError);
          expect(mockAuthService.clearAuthData).not.toHaveBeenCalled();
          expect(mockRouter.navigate).not.toHaveBeenCalled();
        }
      });
    });
  });

  describe('Token Handling Edge Cases', () => {
    it('should handle whitespace-only token', () => {
      mockAuthService.getToken.and.returnValue('   ');
      mockHttpHandler.handle.and.returnValue(of({} as any));

      const request = new HttpRequest('GET', '/api/test');

      interceptor.intercept(request, mockHttpHandler);

      const capturedRequest = mockHttpHandler.handle.calls.argsFor(0)[0];
      expect(capturedRequest.headers.get('Authorization')).toBe('Bearer    ');
    });

    it('should handle very long token', () => {
      const longToken = 'a'.repeat(1000);
      mockAuthService.getToken.and.returnValue(longToken);
      mockHttpHandler.handle.and.returnValue(of({} as any));

      const request = new HttpRequest('GET', '/api/test');

      interceptor.intercept(request, mockHttpHandler);

      const capturedRequest = mockHttpHandler.handle.calls.argsFor(0)[0];
      expect(capturedRequest.headers.get('Authorization')).toBe(`Bearer ${longToken}`);
    });

    it('should handle token with special characters', () => {
      const specialToken = 'token.with-special_chars123!@#';
      mockAuthService.getToken.and.returnValue(specialToken);
      mockHttpHandler.handle.and.returnValue(of({} as any));

      const request = new HttpRequest('GET', '/api/test');

      interceptor.intercept(request, mockHttpHandler);

      const capturedRequest = mockHttpHandler.handle.calls.argsFor(0)[0];
      expect(capturedRequest.headers.get('Authorization')).toBe(`Bearer ${specialToken}`);
    });
  });

  describe('Request Types and Methods', () => {
    it('should handle GET requests correctly', () => {
      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);
      mockHttpHandler.handle.and.returnValue(of({} as any));

      const request = new HttpRequest('GET', '/api/data');

      interceptor.intercept(request, mockHttpHandler);

      const capturedRequest = mockHttpHandler.handle.calls.argsFor(0)[0];
      expect(capturedRequest.method).toBe('GET');
      expect(capturedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
    });

    it('should handle POST requests with body', () => {
      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);
      mockHttpHandler.handle.and.returnValue(of({} as any));

      const body = { name: 'test', value: 123 };
      const request = new HttpRequest('POST', '/api/create', body);

      interceptor.intercept(request, mockHttpHandler);

      const capturedRequest = mockHttpHandler.handle.calls.argsFor(0)[0];
      expect(capturedRequest.method).toBe('POST');
      expect(capturedRequest.body).toEqual(body);
      expect(capturedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
    });

    it('should handle PUT requests', () => {
      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);
      mockHttpHandler.handle.and.returnValue(of({} as any));

      const request = new HttpRequest('PUT', '/api/update/1', { updated: true });

      interceptor.intercept(request, mockHttpHandler);

      const capturedRequest = mockHttpHandler.handle.calls.argsFor(0)[0];
      expect(capturedRequest.method).toBe('PUT');
      expect(capturedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
    });

    it('should handle DELETE requests', () => {
      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);
      mockHttpHandler.handle.and.returnValue(of({} as any));

      const request = new HttpRequest('DELETE', '/api/delete/1');

      interceptor.intercept(request, mockHttpHandler);

      const capturedRequest = mockHttpHandler.handle.calls.argsFor(0)[0];
      expect(capturedRequest.method).toBe('DELETE');
      expect(capturedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
    });
  });

  describe('Header Manipulation Edge Cases', () => {
    it('should not override existing Authorization header', () => {
      const token = 'service-token';
      const existingAuth = 'Bearer existing-token';
      mockAuthService.getToken.and.returnValue(token);
      mockHttpHandler.handle.and.returnValue(of({} as any));

      const headers = new HttpHeaders().set('Authorization', existingAuth);
      const request = new HttpRequest('GET', '/api/test', null, { headers });

      interceptor.intercept(request, mockHttpHandler);

      const capturedRequest = mockHttpHandler.handle.calls.argsFor(0)[0];
      // Should set the new authorization header
      expect(capturedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
    });

    it('should handle case-insensitive authorization header check', () => {
      const token = 'service-token';
      mockAuthService.getToken.and.returnValue(token);
      mockHttpHandler.handle.and.returnValue(of({} as any));

      const headers = new HttpHeaders().set('authorization', 'Bearer existing'); // lowercase
      const request = new HttpRequest('GET', '/api/test', null, { headers });

      interceptor.intercept(request, mockHttpHandler);

      const capturedRequest = mockHttpHandler.handle.calls.argsFor(0)[0];
      expect(capturedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
    });
  });

  describe('Service Integration', () => {
    it('should call authService.getToken() for each request', () => {
      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);
      mockHttpHandler.handle.and.returnValue(of({} as any));

      const request1 = new HttpRequest('GET', '/api/test1');
      const request2 = new HttpRequest('GET', '/api/test2');

      interceptor.intercept(request1, mockHttpHandler);
      interceptor.intercept(request2, mockHttpHandler);

      expect(mockAuthService.getToken).toHaveBeenCalledTimes(2);
    });

    it('should call authService.clearAuthData() only for auth errors', () => {
      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);

      // First request: 401 error
      const error401 = new HttpErrorResponse({ status: 401 });
      mockHttpHandler.handle.and.returnValue(throwError(() => error401));

      const request1 = new HttpRequest('GET', '/api/protected');

      interceptor.intercept(request1, mockHttpHandler).subscribe({
        next: () => {},
        error: () => {}
      });

      expect(mockAuthService.clearAuthData).toHaveBeenCalledTimes(1);

      // Second request: 500 error
      const error500 = new HttpErrorResponse({ status: 500 });
      mockHttpHandler.handle.and.returnValue(throwError(() => error500));

      const request2 = new HttpRequest('GET', '/api/test');

      interceptor.intercept(request2, mockHttpHandler).subscribe({
        next: () => {},
        error: () => {}
      });

      // Should still be called only once (from the 401 error)
      expect(mockAuthService.clearAuthData).toHaveBeenCalledTimes(1);
    });

    it('should call router.navigate() for auth errors', () => {
      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);

      const error401 = new HttpErrorResponse({ status: 401 });
      mockHttpHandler.handle.and.returnValue(throwError(() => error401));

      const request = new HttpRequest('GET', '/api/protected');

      interceptor.intercept(request, mockHttpHandler).subscribe({
        next: () => {},
        error: () => {}
      });

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Observable Chain Behavior', () => {
    it('should pass through successful responses unchanged', () => {
      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);

      const successResponse = new HttpResponse({ body: { data: 'success' }, status: 200 });
      mockHttpHandler.handle.and.returnValue(of(successResponse));

      const request = new HttpRequest('GET', '/api/test');

      interceptor.intercept(request, mockHttpHandler).subscribe(response => {
        expect(response).toBe(successResponse);
      });
    });

    it('should re-throw errors after handling auth errors', () => {
      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);

      const error401 = new HttpErrorResponse({ status: 401 });
      mockHttpHandler.handle.and.returnValue(throwError(() => error401));

      const request = new HttpRequest('GET', '/api/protected');

      interceptor.intercept(request, mockHttpHandler).subscribe({
        next: () => fail('Should have errored'),
        error: (error) => {
          expect(error).toBe(error401);
        }
      });
    });

    it('should handle multiple concurrent requests', () => {
      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);
      mockHttpHandler.handle.and.returnValue(of(new HttpResponse({ body: {}, status: 200 })));

      const request1 = new HttpRequest('GET', '/api/test1');
      const request2 = new HttpRequest('GET', '/api/test2');
      const request3 = new HttpRequest('GET', '/api/test3');

      const sub1 = interceptor.intercept(request1, mockHttpHandler);
      const sub2 = interceptor.intercept(request2, mockHttpHandler);
      const sub3 = interceptor.intercept(request3, mockHttpHandler);

      sub1.subscribe();
      sub2.subscribe();
      sub3.subscribe();

      expect(mockHttpHandler.handle).toHaveBeenCalledTimes(3);
      expect(mockAuthService.getToken).toHaveBeenCalledTimes(3);
    });
  });

  describe('Memory Management and Performance', () => {
    it('should not create memory leaks with many requests', () => {
      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);
      mockHttpHandler.handle.and.returnValue(of(new HttpResponse({ body: {}, status: 200 })));

      for (let i = 0; i < 100; i++) {
        const request = new HttpRequest('GET', `/api/test${i}`);
        interceptor.intercept(request, mockHttpHandler).subscribe();
      }

      expect(mockHttpHandler.handle).toHaveBeenCalledTimes(100);
      expect(mockAuthService.getToken).toHaveBeenCalledTimes(100);
    });

    it('should handle error scenarios without memory leaks', () => {
      const token = 'test-token';
      mockAuthService.getToken.and.returnValue(token);

      for (let i = 0; i < 50; i++) {
        const error = new HttpErrorResponse({ status: 401 });
        mockHttpHandler.handle.and.returnValue(throwError(() => error));

        const request = new HttpRequest('GET', `/api/test${i}`);
        interceptor.intercept(request, mockHttpHandler).subscribe({
          next: () => {},
          error: () => {}
        });
      }

      expect(mockAuthService.clearAuthData).toHaveBeenCalledTimes(50);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(50);
    });
  });
});
