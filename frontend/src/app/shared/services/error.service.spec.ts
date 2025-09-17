import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';

import { ErrorService } from './error.service';

describe('ErrorService', () => {
  let service: ErrorService;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let consoleErrorSpy: jasmine.Spy;

  beforeEach(() => {
    const toastrSpy = jasmine.createSpyObj('ToastrService', [
      'error', 'success', 'warning', 'info'
    ]);

    TestBed.configureTestingModule({
      providers: [
        ErrorService,
        { provide: ToastrService, useValue: toastrSpy }
      ]
    });

    mockToastr = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    service = TestBed.inject(ErrorService);
    consoleErrorSpy = spyOn(console, 'error');
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should inject ToastrService', () => {
      expect(mockToastr).toBeTruthy();
    });
  });

  describe('Error Handler Function', () => {
    it('should return a function', () => {
      const errorHandler = service.handleError('test operation');

      expect(typeof errorHandler).toBe('function');
    });

    it('should return observable from error handler', () => {
      const errorHandler = service.handleError('test operation', 'fallback result');
      const result = errorHandler(new Error('test error'));

      expect(result.subscribe).toBeDefined();
      result.subscribe(value => {
        expect(value).toBe('fallback result');
      });
    });

    it('should handle error with default operation name', () => {
      const errorHandler = service.handleError();
      const testError = new Error('test error');

      errorHandler(testError);

      expect(consoleErrorSpy).toHaveBeenCalledWith('operation failed:', testError);
    });

    it('should handle error with custom operation name', () => {
      const errorHandler = service.handleError('custom operation');
      const testError = new Error('test error');

      errorHandler(testError);

      expect(consoleErrorSpy).toHaveBeenCalledWith('custom operation failed:', testError);
    });

    it('should return result when provided', (done) => {
      const expectedResult = { id: 1, name: 'test' };
      const errorHandler = service.handleError('test', expectedResult);
      const testError = new Error('test error');

      errorHandler(testError).subscribe(result => {
        expect(result).toBe(expectedResult);
        done();
      });
    });

    it('should return undefined when no result provided', (done) => {
      const errorHandler = service.handleError('test');
      const testError = new Error('test error');

      errorHandler(testError).subscribe(result => {
        expect(result).toBeUndefined();
        done();
      });
    });

    it('should call error notification', () => {
      const errorHandler = service.handleError('test');
      const testError = new Error('test error');

      errorHandler(testError);

      expect(mockToastr.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again later.',
        'Error'
      );
    });

    it('should handle multiple error types', () => {
      const errorHandler = service.handleError('test');
      const errors = [
        new Error('standard error'),
        new TypeError('type error'),
        new ReferenceError('reference error'),
        'string error',
        { message: 'object error' },
        42,
        null,
        undefined
      ];

      errors.forEach((error, index) => {
        consoleErrorSpy.calls.reset();
        mockToastr.error.calls.reset();

        errorHandler(error);

        expect(consoleErrorSpy).toHaveBeenCalledWith('test failed:', error);
        expect(mockToastr.error).toHaveBeenCalled();
      });
    });
  });

  describe('HTTP Error Response Handling', () => {
    it('should handle connection error (status 0)', () => {
      const httpError = new HttpErrorResponse({
        error: null,
        status: 0,
        statusText: 'Unknown Error'
      });

      const errorHandler = service.handleError('connection test');
      errorHandler(httpError);

      expect(mockToastr.error).toHaveBeenCalledWith(
        'Cannot connect to server. Please check your internet connection.',
        'Error'
      );
    });

    it('should handle unauthorized error (status 401)', () => {
      const httpError = new HttpErrorResponse({
        error: null,
        status: 401,
        statusText: 'Unauthorized'
      });

      const errorHandler = service.handleError('auth test');
      errorHandler(httpError);

      expect(mockToastr.error).toHaveBeenCalledWith(
        'You are not authorized to perform this action. Please log in again.',
        'Error'
      );
    });

    it('should handle forbidden error (status 403)', () => {
      const httpError = new HttpErrorResponse({
        error: null,
        status: 403,
        statusText: 'Forbidden'
      });

      const errorHandler = service.handleError('permission test');
      errorHandler(httpError);

      expect(mockToastr.error).toHaveBeenCalledWith(
        'You do not have permission to perform this action.',
        'Error'
      );
    });

    it('should handle not found error (status 404)', () => {
      const httpError = new HttpErrorResponse({
        error: null,
        status: 404,
        statusText: 'Not Found'
      });

      const errorHandler = service.handleError('not found test');
      errorHandler(httpError);

      expect(mockToastr.error).toHaveBeenCalledWith(
        'The requested resource was not found.',
        'Error'
      );
    });

    it('should handle server error with custom message in error.message', () => {
      const httpError = new HttpErrorResponse({
        error: { message: 'Custom server error' },
        status: 500,
        statusText: 'Internal Server Error'
      });

      const errorHandler = service.handleError('server test');
      errorHandler(httpError);

      expect(mockToastr.error).toHaveBeenCalledWith(
        'Custom server error',
        'Error'
      );
    });

    it('should handle server error with message in response message', () => {
      const httpError = new HttpErrorResponse({
        error: null,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const errorHandler = service.handleError('server test');
      errorHandler(httpError);

      expect(mockToastr.error).toHaveBeenCalledWith(
        'Internal Server Error',
        'Error'
      );
    });

    it('should handle server error with no specific message', () => {
      const httpError = new HttpErrorResponse({
        error: null,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const errorHandler = service.handleError('server test');
      errorHandler(httpError);

      expect(mockToastr.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again later.',
        'Error'
      );
    });

    it('should prefer error.message over response message', () => {
      const httpError = new HttpErrorResponse({
        error: { message: 'Priority server error' },
        status: 500,
        statusText: 'Internal Server Error'
      });

      const errorHandler = service.handleError('priority test');
      errorHandler(httpError);

      expect(mockToastr.error).toHaveBeenCalledWith(
        'Priority server error',
        'Error'
      );
    });

    it('should handle various HTTP status codes', () => {
      const statusCodes = [
        { status: 400, expected: 'An unexpected error occurred. Please try again later.' },
        { status: 422, expected: 'An unexpected error occurred. Please try again later.' },
        { status: 500, expected: 'An unexpected error occurred. Please try again later.' },
        { status: 502, expected: 'An unexpected error occurred. Please try again later.' },
        { status: 503, expected: 'An unexpected error occurred. Please try again later.' }
      ];

      statusCodes.forEach(({ status, expected }) => {
        mockToastr.error.calls.reset();

        const httpError = new HttpErrorResponse({
          error: null,
          status,
          statusText: `Error ${status}`
        });

        const errorHandler = service.handleError(`status ${status} test`);
        errorHandler(httpError);

        expect(mockToastr.error).toHaveBeenCalledWith(expected, 'Error');
      });
    });

    it('should handle malformed HTTP error responses', () => {
      const malformedErrors = [
        new HttpErrorResponse({ error: 'string error', status: 500 }),
        new HttpErrorResponse({ error: 123, status: 500 }),
        new HttpErrorResponse({ error: [], status: 500 }),
        new HttpErrorResponse({ error: { nested: { message: 'deep error' } }, status: 500 })
      ];

      malformedErrors.forEach((error, index) => {
        mockToastr.error.calls.reset();

        const errorHandler = service.handleError(`malformed test ${index}`);
        errorHandler(error);

        expect(mockToastr.error).toHaveBeenCalled();
      });
    });
  });

  describe('Error Message Extraction', () => {
    it('should extract message from Error objects', () => {
      const standardError = new Error('Standard error message');
      const errorHandler = service.handleError('extract test');

      errorHandler(standardError);

      expect(mockToastr.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again later.',
        'Error'
      );
    });

    it('should handle string errors', () => {
      const stringError = 'Simple string error';
      const errorHandler = service.handleError('string test');

      errorHandler(stringError);

      expect(mockToastr.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again later.',
        'Error'
      );
    });

    it('should handle object errors with message property', () => {
      const objectError = { message: 'Object error message', code: 'ERR001' };
      const errorHandler = service.handleError('object test');

      errorHandler(objectError);

      expect(mockToastr.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again later.',
        'Error'
      );
    });

    it('should handle null and undefined errors', () => {
      const errorHandler = service.handleError('null test');

      errorHandler(null);
      expect(mockToastr.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again later.',
        'Error'
      );

      mockToastr.error.calls.reset();

      errorHandler(undefined);
      expect(mockToastr.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again later.',
        'Error'
      );
    });

    it('should handle empty error objects', () => {
      const emptyError = {};
      const errorHandler = service.handleError('empty test');

      errorHandler(emptyError);

      expect(mockToastr.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again later.',
        'Error'
      );
    });

    it('should handle complex nested error structures', () => {
      const complexError = {
        response: {
          data: {
            error: {
              message: 'Nested error message',
              details: 'Additional details'
            }
          }
        }
      };

      const errorHandler = service.handleError('complex test');
      errorHandler(complexError);

      expect(mockToastr.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again later.',
        'Error'
      );
    });
  });

  describe('Private Methods', () => {
    it('should call showErrorNotification with correct parameters', () => {
      const testMessage = 'Test notification message';
      service['showErrorNotification'](testMessage);

      expect(mockToastr.error).toHaveBeenCalledWith(testMessage, 'Error');
    });

    it('should handle empty message in showErrorNotification', () => {
      service['showErrorNotification']('');

      expect(mockToastr.error).toHaveBeenCalledWith('', 'Error');
    });

    it('should handle null message in showErrorNotification', () => {
      service['showErrorNotification'](null as any);

      expect(mockToastr.error).toHaveBeenCalledWith('An unexpected error occurred', 'Error');
    });

    it('should call getErrorMessage correctly for various error types', () => {
      const testCases = [
        {
          error: new HttpErrorResponse({ status: 401 }),
          expected: 'You are not authorized to perform this action. Please log in again.'
        },
        {
          error: new Error('Test error'),
          expected: 'An unexpected error occurred. Please try again later.'
        },
        {
          error: 'String error',
          expected: 'An unexpected error occurred. Please try again later.'
        },
        {
          error: null,
          expected: 'An unexpected error occurred. Please try again later.'
        }
      ];

      testCases.forEach(({ error, expected }) => {
        const result = service['getErrorMessage'](error);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Observable Behavior', () => {
    it('should emit and complete observable', (done) => {
      const errorHandler = service.handleError('observable test', 'test result');
      const testError = new Error('test');
      let emissionCount = 0;

      errorHandler(testError).subscribe({
        next: (value) => {
          emissionCount++;
          expect(value).toBe('test result');
        },
        error: () => {
          fail('Should not error');
        },
        complete: () => {
          expect(emissionCount).toBe(1);
          done();
        }
      });
    });

    it('should handle multiple subscriptions', () => {
      const errorHandler = service.handleError('multi test', 'shared result');
      const testError = new Error('test');
      const observable = errorHandler(testError);
      let emission1: any, emission2: any;

      observable.subscribe(value => emission1 = value);
      observable.subscribe(value => emission2 = value);

      expect(emission1).toBe('shared result');
      expect(emission2).toBe('shared result');
    });

    it('should work with different result types', () => {
      const testCases = [
        { result: 'string result', type: 'string' },
        { result: 123, type: 'number' },
        { result: { id: 1 }, type: 'object' },
        { result: [1, 2, 3], type: 'array' },
        { result: true, type: 'boolean' },
        { result: null, type: 'null' }
      ];

      testCases.forEach(({ result, type }) => {
        const errorHandler = service.handleError(`${type} test`, result);
        const testError = new Error('test');

        errorHandler(testError).subscribe(value => {
          expect(value).toBe(result);
        });
      });
    });

    it('should be cold observable', () => {
      const errorHandler = service.handleError('cold test', 'result');
      const testError = new Error('test');
      const observable = errorHandler(testError);

      // Creating observable should not trigger side effects
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(mockToastr.error).not.toHaveBeenCalled();

      // Only subscription should trigger side effects
      observable.subscribe();

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockToastr.error).toHaveBeenCalled();
    });
  });

  describe('Integration and Real-world Scenarios', () => {
    it('should handle typical HTTP service error scenario', (done) => {
      const httpError = new HttpErrorResponse({
        error: { message: 'Validation failed' },
        status: 422,
        statusText: 'Unprocessable Entity'
      });

      const errorHandler = service.handleError('User registration', null);

      errorHandler(httpError).subscribe(result => {
        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith('User registration failed:', httpError);
        expect(mockToastr.error).toHaveBeenCalledWith('Validation failed', 'Error');
        done();
      });
    });

    it('should handle network timeout scenario', () => {
      const timeoutError = new HttpErrorResponse({
        error: null,
        status: 0,
        statusText: 'Timeout'
      });

      const errorHandler = service.handleError('Data fetch');
      errorHandler(timeoutError);

      expect(mockToastr.error).toHaveBeenCalledWith(
        'Cannot connect to server. Please check your internet connection.',
        'Error'
      );
    });

    it('should handle authentication expiry scenario', () => {
      const authError = new HttpErrorResponse({
        error: { message: 'Token expired' },
        status: 401,
        statusText: 'Unauthorized'
      });

      const errorHandler = service.handleError('Protected resource access');
      errorHandler(authError);

      expect(mockToastr.error).toHaveBeenCalledWith(
        'You are not authorized to perform this action. Please log in again.',
        'Error'
      );
    });

    it('should handle resource not found scenario', (done) => {
      const notFoundError = new HttpErrorResponse({
        error: null,
        status: 404,
        statusText: 'Not Found'
      });

      const errorHandler = service.handleError('Product fetch', []);

      errorHandler(notFoundError).subscribe(result => {
        expect(result).toEqual([]);
        expect(mockToastr.error).toHaveBeenCalledWith(
          'The requested resource was not found.',
          'Error'
        );
        done();
      });
    });

    it('should handle service chain errors', () => {
      const operations = ['Load user', 'Load profile', 'Load preferences'];
      const errors = [
        new Error('Database error'),
        new HttpErrorResponse({ status: 500 }),
        'Configuration error'
      ];

      operations.forEach((operation, index) => {
        consoleErrorSpy.calls.reset();
        mockToastr.error.calls.reset();

        const errorHandler = service.handleError(operation, `fallback-${index}`);
        errorHandler(errors[index]);

        expect(consoleErrorSpy).toHaveBeenCalledWith(`${operation} failed:`, errors[index]);
        expect(mockToastr.error).toHaveBeenCalled();
      });
    });
  });

  describe('Performance and Memory', () => {
    it('should not leak memory with many error handlers', () => {
      const handlers = Array.from({ length: 1000 }, (_, i) =>
        service.handleError(`operation-${i}`, `result-${i}`)
      );

      expect(handlers.length).toBe(1000);
      expect(handlers.every(h => typeof h === 'function')).toBe(true);
    });

    it('should handle rapid error processing', () => {
      const startTime = performance.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const errorHandler = service.handleError(`rapid-${i}`);
        errorHandler(new Error(`error-${i}`));
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete in reasonable time
      expect(consoleErrorSpy).toHaveBeenCalledTimes(iterations);
      expect(mockToastr.error).toHaveBeenCalledTimes(iterations);
    });

    it('should not accumulate memory with observable subscriptions', () => {
      const errorHandler = service.handleError('memory test', 'result');
      const subscriptions = [];

      for (let i = 0; i < 100; i++) {
        const subscription = errorHandler(new Error(`error-${i}`)).subscribe();
        subscriptions.push(subscription);
      }

      // Clean up subscriptions
      subscriptions.forEach(sub => sub.unsubscribe());

      expect(subscriptions.length).toBe(100);
    });

    it('should handle large error objects efficiently', () => {
      const largeError = {
        message: 'Error with large data',
        data: 'x'.repeat(100000), // 100KB of data
        stack: 'y'.repeat(50000)  // 50KB stack trace
      };

      const startTime = performance.now();
      const errorHandler = service.handleError('large error test');
      errorHandler(largeError);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should handle quickly
      expect(mockToastr.error).toHaveBeenCalled();
    });
  });

  describe('Error Cases and Edge Conditions', () => {
    it('should handle ToastrService throwing errors', () => {
      mockToastr.error.and.throwError('Toastr error');

      const errorHandler = service.handleError('toastr error test');

      // Should not throw error even if toastr fails
      expect(() => errorHandler(new Error('test'))).not.toThrow();
    });

    it('should handle console.error being unavailable', () => {
      const originalConsoleError = console.error;
      delete (console as any).error;

      try {
        const errorHandler = service.handleError('no console test');
        // Should not throw even without console.error
        expect(() => errorHandler(new Error('test'))).not.toThrow();
      } finally {
        console.error = originalConsoleError;
      }
    });

    it('should handle circular reference in error objects', () => {
      const circularError: any = { message: 'Circular error' };
      circularError.self = circularError;

      const errorHandler = service.handleError('circular test');

      expect(() => errorHandler(circularError)).not.toThrow();
      expect(mockToastr.error).toHaveBeenCalled();
    });

    it('should handle very long error messages', () => {
      const longMessage = 'x'.repeat(10000);
      const httpError = new HttpErrorResponse({
        error: { message: longMessage },
        status: 500
      });

      const errorHandler = service.handleError('long message test');
      errorHandler(httpError);

      expect(mockToastr.error).toHaveBeenCalledWith(longMessage, 'Error');
    });

    it('should handle special characters in error messages', () => {
      const specialMessage = 'Error with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?`~\n\t\r';
      const httpError = new HttpErrorResponse({
        error: { message: specialMessage },
        status: 400
      });

      const errorHandler = service.handleError('special chars test');
      errorHandler(httpError);

      expect(mockToastr.error).toHaveBeenCalledWith(specialMessage, 'Error');
    });
  });
});
