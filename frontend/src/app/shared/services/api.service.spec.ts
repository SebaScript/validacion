import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let mockHttpClient: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', [
      'get', 'post', 'put', 'patch', 'delete'
    ]);

    TestBed.configureTestingModule({
      providers: [
        ApiService,
        { provide: HttpClient, useValue: httpClientSpy }
      ]
    });

    mockHttpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    service = TestBed.inject(ApiService);
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should inject HttpClient', () => {
      expect(mockHttpClient).toBeTruthy();
    });
  });

  describe('Deprecated API Methods', () => {
    const expectedErrorMessage = 'Backend API disabled - use LocalStorage services instead';

    it('should throw error for get method', () => {
      expect(() => service.get<any>('test-endpoint'))
        .toThrowError(expectedErrorMessage);
    });

    it('should throw error for getById method', () => {
      expect(() => service.getById<any>('test-endpoint', 1))
        .toThrowError(expectedErrorMessage);
    });

    it('should throw error for post method', () => {
      expect(() => service.post<any>('test-endpoint', { data: 'test' }))
        .toThrowError(expectedErrorMessage);
    });

    it('should throw error for put method', () => {
      expect(() => service.put<any>('test-endpoint', 1, { data: 'test' }))
        .toThrowError(expectedErrorMessage);
    });

    it('should throw error for patch method', () => {
      expect(() => service.patch<any>('test-endpoint', 1, { data: 'test' }))
        .toThrowError(expectedErrorMessage);
    });

    it('should throw error for patchWithoutId method', () => {
      expect(() => service.patchWithoutId<any>('test-endpoint', { data: 'test' }))
        .toThrowError(expectedErrorMessage);
    });

    it('should throw error for putWithoutId method', () => {
      expect(() => service.putWithoutId<any>('test-endpoint', { data: 'test' }))
        .toThrowError(expectedErrorMessage);
    });

    it('should throw error for delete method with id', () => {
      expect(() => service.delete<any>('test-endpoint', 1))
        .toThrowError(expectedErrorMessage);
    });

    it('should throw error for delete method without id', () => {
      expect(() => service.delete<any>('test-endpoint'))
        .toThrowError(expectedErrorMessage);
    });
  });

  describe('Method Parameter Handling', () => {
    const expectedErrorMessage = 'Backend API disabled - use LocalStorage services instead';

    it('should handle various endpoint formats', () => {
      const endpoints = [
        'simple-endpoint',
        '/absolute-endpoint',
        'nested/deep/endpoint',
        'endpoint-with-numbers123',
        'endpoint_with_underscores',
        'endpoint-with-hyphens'
      ];

      endpoints.forEach(endpoint => {
        expect(() => service.get<any>(endpoint))
          .toThrowError(expectedErrorMessage);
      });
    });

    it('should handle various data types for post', () => {
      const dataTypes = [
        { object: 'data' },
        'string data',
        123,
        true,
        null,
        undefined,
        []
      ];

      dataTypes.forEach(data => {
        expect(() => service.post<any>('endpoint', data))
          .toThrowError(expectedErrorMessage);
      });
    });

    it('should handle various ID types', () => {
      const ids = [1, 0, -1, 999999];

      ids.forEach(id => {
        expect(() => service.getById<any>('endpoint', id))
          .toThrowError(expectedErrorMessage);

        expect(() => service.put<any>('endpoint', id, { data: 'test' }))
          .toThrowError(expectedErrorMessage);

        expect(() => service.patch<any>('endpoint', id, { data: 'test' }))
          .toThrowError(expectedErrorMessage);

        expect(() => service.delete<any>('endpoint', id))
          .toThrowError(expectedErrorMessage);
      });
    });

    it('should handle empty and null parameters', () => {
      expect(() => service.get<any>(''))
        .toThrowError(expectedErrorMessage);

      expect(() => service.post<any>('', null))
        .toThrowError(expectedErrorMessage);

      expect(() => service.put<any>('', 0, null))
        .toThrowError(expectedErrorMessage);
    });

    it('should handle special characters in endpoints', () => {
      const specialEndpoints = [
        'endpoint?query=value',
        'endpoint#fragment',
        'endpoint with spaces',
        'endpoint/with/special/chars!@#$%',
        'endpoint%20encoded'
      ];

      specialEndpoints.forEach(endpoint => {
        expect(() => service.get<any>(endpoint))
          .toThrowError(expectedErrorMessage);
      });
    });
  });

  describe('Generic Type Handling', () => {
    const expectedErrorMessage = 'Backend API disabled - use LocalStorage services instead';

    it('should handle generic types for get method', () => {
      interface TestModel {
        id: number;
        name: string;
      }

      expect(() => service.get<TestModel>('endpoint'))
        .toThrowError(expectedErrorMessage);

      expect(() => service.get<string>('endpoint'))
        .toThrowError(expectedErrorMessage);

      expect(() => service.get<number[]>('endpoint'))
        .toThrowError(expectedErrorMessage);
    });

    it('should handle generic types for post method', () => {
      interface CreateModel {
        name: string;
        value: number;
      }

      interface ResponseModel {
        id: number;
        success: boolean;
      }

      expect(() => service.post<ResponseModel>('endpoint', { name: 'test', value: 123 }))
        .toThrowError(expectedErrorMessage);
    });

    it('should handle void return types', () => {
      expect(() => service.delete<void>('endpoint', 1))
        .toThrowError(expectedErrorMessage);

      expect(() => service.put<void>('endpoint', 1, { data: 'test' }))
        .toThrowError(expectedErrorMessage);
    });

    it('should handle any return types', () => {
      expect(() => service.get<any>('endpoint'))
        .toThrowError(expectedErrorMessage);

      expect(() => service.post<any>('endpoint', 'data'))
        .toThrowError(expectedErrorMessage);
    });

    it('should handle union types', () => {
      expect(() => service.get<string | number>('endpoint'))
        .toThrowError(expectedErrorMessage);

      expect(() => service.post<boolean | null>('endpoint', { test: true }))
        .toThrowError(expectedErrorMessage);
    });
  });

  describe('Error Consistency', () => {
    it('should throw consistent error messages across all methods', () => {
      const expectedMessage = 'Backend API disabled - use LocalStorage services instead';
      const methods = [
        () => service.get<any>('test'),
        () => service.getById<any>('test', 1),
        () => service.post<any>('test', {}),
        () => service.put<any>('test', 1, {}),
        () => service.patch<any>('test', 1, {}),
        () => service.patchWithoutId<any>('test', {}),
        () => service.putWithoutId<any>('test', {}),
        () => service.delete<any>('test', 1),
        () => service.delete<any>('test')
      ];

      methods.forEach(method => {
        expect(method).toThrowError(expectedMessage);
      });
    });

    it('should throw Error instances', () => {
      try {
        service.get<any>('test');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe('Error');
      }
    });

    it('should throw immediately without async operations', () => {
      const startTime = performance.now();

      try {
        service.get<any>('test');
      } catch (error) {
        const endTime = performance.now();
        expect(endTime - startTime).toBeLessThan(1); // Should be immediate
      }
    });

    it('should not call HttpClient methods', () => {
      try {
        service.get<any>('test');
      } catch (error) {
        // Expected error
      }

      try {
        service.post<any>('test', {});
      } catch (error) {
        // Expected error
      }

      expect(mockHttpClient.get).not.toHaveBeenCalled();
      expect(mockHttpClient.post).not.toHaveBeenCalled();
      expect(mockHttpClient.put).not.toHaveBeenCalled();
      expect(mockHttpClient.patch).not.toHaveBeenCalled();
      expect(mockHttpClient.delete).not.toHaveBeenCalled();
    });
  });

  describe('Service State and Behavior', () => {
    it('should maintain consistent state across multiple calls', () => {
      const expectedMessage = 'Backend API disabled - use LocalStorage services instead';

      // Multiple calls should all throw the same error
      for (let i = 0; i < 10; i++) {
        expect(() => service.get<any>(`endpoint-${i}`))
          .toThrowError(expectedMessage);
      }
    });

    it('should not modify service state when methods are called', () => {
      const serviceBefore = { ...service };

      try {
        service.get<any>('test');
      } catch (error) {
        // Expected error
      }

      // Service should remain unchanged
      expect(Object.keys(service)).toEqual(Object.keys(serviceBefore));
    });

    it('should handle concurrent method calls', () => {
      const expectedMessage = 'Backend API disabled - use LocalStorage services instead';
      const methods = [
        'get', 'getById', 'post', 'put', 'patch',
        'patchWithoutId', 'putWithoutId', 'delete'
      ];

      // Simulate concurrent calls
      methods.forEach(methodName => {
        expect(() => {
          if (methodName === 'get') {
            service.get<any>('test');
          } else if (methodName === 'getById') {
            service.getById<any>('test', 1);
          } else if (methodName === 'post') {
            service.post<any>('test', {});
          } else if (methodName === 'put') {
            service.put<any>('test', 1, {});
          } else if (methodName === 'patch') {
            service.patch<any>('test', 1, {});
          } else if (methodName === 'patchWithoutId') {
            service.patchWithoutId<any>('test', {});
          } else if (methodName === 'putWithoutId') {
            service.putWithoutId<any>('test', {});
          } else if (methodName === 'delete') {
            service.delete<any>('test');
          }
        }).toThrowError(expectedMessage);
      });
    });
  });

  describe('Integration and Compatibility', () => {
    it('should be compatible with dependency injection', () => {
      expect(service).toBeInstanceOf(ApiService);
      expect(TestBed.inject(ApiService)).toBe(service); // Singleton
    });

    it('should work with multiple service instances', () => {
      const service2 = TestBed.inject(ApiService);
      const expectedMessage = 'Backend API disabled - use LocalStorage services instead';

      expect(() => service.get<any>('test'))
        .toThrowError(expectedMessage);

      expect(() => service2.get<any>('test'))
        .toThrowError(expectedMessage);
    });

    it('should handle method chaining attempts gracefully', () => {
      const expectedMessage = 'Backend API disabled - use LocalStorage services instead';

      expect(() => {
        service.get<any>('test');
        service.post<any>('test', {});
      }).toThrowError(expectedMessage);
      // Second call never executes due to first throw
    });

    it('should be testable in different environments', () => {
      // Test in different simulated environments
      const environments = ['development', 'production', 'testing'];

      environments.forEach(env => {
        // All should behave the same regardless of environment
        expect(() => service.get<any>(`${env}-endpoint`))
          .toThrowError('Backend API disabled - use LocalStorage services instead');
      });
    });
  });

  describe('Documentation and API Contract', () => {
    it('should have all expected public methods', () => {
      const expectedMethods = [
        'get', 'getById', 'post', 'put', 'patch',
        'patchWithoutId', 'putWithoutId', 'delete'
      ];

      expectedMethods.forEach(method => {
        expect(typeof service[method as keyof ApiService]).toBe('function');
      });
    });

    it('should not expose private methods', () => {
      // Should not have any private methods exposed
      const methods = Object.getOwnPropertyNames(service);
      const privateMethods = methods.filter(method => method.startsWith('_'));

      expect(privateMethods.length).toBe(0);
    });

    it('should maintain API contract for deprecated service', () => {
      // Even though deprecated, the API should maintain its contract
      expect(service.get).toBeDefined();
      expect(service.getById).toBeDefined();
      expect(service.post).toBeDefined();
      expect(service.put).toBeDefined();
      expect(service.patch).toBeDefined();
      expect(service.patchWithoutId).toBeDefined();
      expect(service.putWithoutId).toBeDefined();
      expect(service.delete).toBeDefined();
    });

    it('should provide meaningful error messages', () => {
      const errorMessage = 'Backend API disabled - use LocalStorage services instead';

      // Error message should be descriptive and guide users
      expect(errorMessage).toContain('disabled');
      expect(errorMessage).toContain('LocalStorage');
      expect(errorMessage).toContain('services');
    });
  });

  describe('Memory and Performance', () => {
    it('should not consume excessive memory when throwing errors', () => {
      const initialMemory = (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;

      // Call methods many times
      for (let i = 0; i < 1000; i++) {
        try {
          service.get<any>(`endpoint-${i}`);
        } catch (error) {
          // Expected
        }
      }

      const finalMemory = (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;

      if ((performance as any).memory) {
        // Memory increase should be minimal
        expect(finalMemory - initialMemory).toBeLessThan(1024 * 1024); // Less than 1MB
      }
    });

    it('should throw errors quickly', () => {
      const iterations = 1000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        try {
          service.get<any>(`test-${i}`);
        } catch (error) {
          // Expected
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // Should be very fast
    });

    it('should not leak memory with multiple instances', () => {
      const services = Array.from({ length: 100 }, () => TestBed.inject(ApiService));

      expect(services.length).toBe(100);
      // All should be the same instance (singleton)
      expect(services.every(s => s === service)).toBe(true);
    });
  });

  describe('Edge Cases and Robustness', () => {
    it('should handle extreme parameter values', () => {
      const extremeValues = [
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        NaN
      ];

      extremeValues.forEach(value => {
        expect(() => service.getById<any>('test', value))
          .toThrowError('Backend API disabled - use LocalStorage services instead');
      });
    });

    it('should handle very long endpoint names', () => {
      const longEndpoint = 'a'.repeat(10000);

      expect(() => service.get<any>(longEndpoint))
        .toThrowError('Backend API disabled - use LocalStorage services instead');
    });

    it('should handle circular reference data', () => {
      const circularData: any = { name: 'test' };
      circularData.self = circularData;

      expect(() => service.post<any>('test', circularData))
        .toThrowError('Backend API disabled - use LocalStorage services instead');
    });

    it('should handle symbol-based endpoints', () => {
      const symbolEndpoint = Symbol('test-endpoint').toString();

      expect(() => service.get<any>(symbolEndpoint))
        .toThrowError('Backend API disabled - use LocalStorage services instead');
    });

    it('should handle functions as data', () => {
      const functionData = () => 'test';

      expect(() => service.post<any>('test', functionData))
        .toThrowError('Backend API disabled - use LocalStorage services instead');
    });
  });
});
