import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { authGuard, adminGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { User } from '../interfaces/user.interface';

describe('Auth Guards', () => {
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockUser: User = {
    userId: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'client'
  };

  const mockAdminUser: User = {
    userId: 2,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
  };

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isAuthenticated',
      'getProfile',
      'clearAuthData'
    ]);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  describe('authGuard', () => {
    describe('User Not Authenticated Locally', () => {
      beforeEach(() => {
        mockAuthService.isAuthenticated.and.returnValue(false);
      });

      it('should return false when user is not authenticated', () => {
        const result = TestBed.runInInjectionContext(() =>
          authGuard({} as any, {} as any)
        );

        expect(result).toBe(false);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
        expect(mockAuthService.getProfile).not.toHaveBeenCalled();
      });

      it('should navigate to login page when user is not authenticated', () => {
        TestBed.runInInjectionContext(() =>
          authGuard({} as any, {} as any)
        );

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
        expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      });

      it('should not call getProfile when user is not authenticated locally', () => {
        TestBed.runInInjectionContext(() =>
          authGuard({} as any, {} as any)
        );

        expect(mockAuthService.getProfile).not.toHaveBeenCalled();
      });
    });

    describe('User Authenticated Locally', () => {
      beforeEach(() => {
        mockAuthService.isAuthenticated.and.returnValue(true);
      });

      it('should return true when profile request succeeds', (done) => {
        mockAuthService.getProfile.and.returnValue(of(mockUser));

        const result = TestBed.runInInjectionContext(() =>
          authGuard({} as any, {} as any)
        );

        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe((canActivate) => {
            expect(canActivate).toBe(true);
            expect(mockAuthService.getProfile).toHaveBeenCalled();
            expect(mockRouter.navigate).not.toHaveBeenCalled();
            done();
          });
        } else {
          fail('Expected observable result');
        }
      });

      it('should return false and navigate to login when profile request fails', (done) => {
        mockAuthService.getProfile.and.returnValue(throwError(() => new Error('Unauthorized')));

        const result = TestBed.runInInjectionContext(() =>
          authGuard({} as any, {} as any)
        );

        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe((canActivate) => {
            expect(canActivate).toBe(false);
            expect(mockAuthService.clearAuthData).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
            done();
          });
        } else {
          fail('Expected observable result');
        }
      });

      it('should clear auth data when profile request fails', (done) => {
        mockAuthService.getProfile.and.returnValue(throwError(() => new Error('Token expired')));

        const result = TestBed.runInInjectionContext(() =>
          authGuard({} as any, {} as any)
        );

        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe(() => {
            expect(mockAuthService.clearAuthData).toHaveBeenCalled();
            expect(mockAuthService.clearAuthData).toHaveBeenCalledTimes(1);
            done();
          });
        } else {
          fail('Expected observable result');
        }
      });

      it('should handle various HTTP error types', (done) => {
        const httpError = { status: 401, message: 'Unauthorized' };
        mockAuthService.getProfile.and.returnValue(throwError(() => httpError));

        const result = TestBed.runInInjectionContext(() =>
          authGuard({} as any, {} as any)
        );

        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe((canActivate) => {
            expect(canActivate).toBe(false);
            expect(mockAuthService.clearAuthData).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
            done();
          });
        } else {
          fail('Expected observable result');
        }
      });

      it('should handle network errors gracefully', (done) => {
        mockAuthService.getProfile.and.returnValue(throwError(() => new Error('Network error')));

        const result = TestBed.runInInjectionContext(() =>
          authGuard({} as any, {} as any)
        );

        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe((canActivate) => {
            expect(canActivate).toBe(false);
            expect(mockAuthService.clearAuthData).toHaveBeenCalled();
            done();
          });
        } else {
          fail('Expected observable result');
        }
      });
    });

    describe('Route and State Parameters', () => {
      beforeEach(() => {
        mockAuthService.isAuthenticated.and.returnValue(true);
        mockAuthService.getProfile.and.returnValue(of(mockUser));
      });

      it('should work with different route configurations', (done) => {
        const mockRoute = { path: 'protected', data: { title: 'Protected' } };
        const mockState = { url: '/protected' };

        const result = TestBed.runInInjectionContext(() =>
          authGuard(mockRoute as any, mockState as any)
        );

        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe((canActivate) => {
            expect(canActivate).toBe(true);
            done();
          });
        } else {
          fail('Expected observable result');
        }
      });

      it('should handle null route and state', (done) => {
        const result = TestBed.runInInjectionContext(() =>
          authGuard(null as any, null as any)
        );

        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe((canActivate) => {
            expect(canActivate).toBe(true);
            done();
          });
        } else {
          fail('Expected observable result');
        }
      });
    });
  });

  describe('adminGuard', () => {
    describe('User Not Authenticated Locally', () => {
      beforeEach(() => {
        mockAuthService.isAuthenticated.and.returnValue(false);
      });

      it('should return false when user is not authenticated', () => {
        const result = TestBed.runInInjectionContext(() =>
          adminGuard({} as any, {} as any)
        );

        expect(result).toBe(false);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin-login']);
        expect(mockAuthService.getProfile).not.toHaveBeenCalled();
      });

      it('should navigate to admin login page when user is not authenticated', () => {
        TestBed.runInInjectionContext(() =>
          adminGuard({} as any, {} as any)
        );

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin-login']);
        expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      });
    });

    describe('User Authenticated Locally', () => {
      beforeEach(() => {
        mockAuthService.isAuthenticated.and.returnValue(true);
      });

      it('should return true when user is admin', (done) => {
        mockAuthService.getProfile.and.returnValue(of(mockAdminUser));

        const result = TestBed.runInInjectionContext(() =>
          adminGuard({} as any, {} as any)
        );

        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe((canActivate) => {
            expect(canActivate).toBe(true);
            expect(mockAuthService.getProfile).toHaveBeenCalled();
            expect(mockRouter.navigate).not.toHaveBeenCalled();
            done();
          });
        } else {
          fail('Expected observable result');
        }
      });

      it('should return false and navigate to admin login when user is not admin', (done) => {
        mockAuthService.getProfile.and.returnValue(of(mockUser)); // Regular user

        const result = TestBed.runInInjectionContext(() =>
          adminGuard({} as any, {} as any)
        );

        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe((canActivate) => {
            expect(canActivate).toBe(false);
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin-login']);
            done();
          });
        } else {
          fail('Expected observable result');
        }
      });

      it('should return false and navigate to admin login when profile request fails', (done) => {
        mockAuthService.getProfile.and.returnValue(throwError(() => new Error('Unauthorized')));

        const result = TestBed.runInInjectionContext(() =>
          adminGuard({} as any, {} as any)
        );

        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe((canActivate) => {
            expect(canActivate).toBe(false);
            expect(mockAuthService.clearAuthData).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin-login']);
            done();
          });
        } else {
          fail('Expected observable result');
        }
      });

      it('should clear auth data when profile request fails', (done) => {
        mockAuthService.getProfile.and.returnValue(throwError(() => new Error('Token expired')));

        const result = TestBed.runInInjectionContext(() =>
          adminGuard({} as any, {} as any)
        );

        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe(() => {
            expect(mockAuthService.clearAuthData).toHaveBeenCalled();
            expect(mockAuthService.clearAuthData).toHaveBeenCalledTimes(1);
            done();
          });
        } else {
          fail('Expected observable result');
        }
      });

      it('should handle user with undefined role', (done) => {
        const userWithoutRole = { ...mockUser, role: undefined };
        mockAuthService.getProfile.and.returnValue(of(userWithoutRole));

        const result = TestBed.runInInjectionContext(() =>
          adminGuard({} as any, {} as any)
        );

        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe((canActivate) => {
            expect(canActivate).toBe(false);
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin-login']);
            done();
          });
        } else {
          fail('Expected observable result');
        }
      });

      it('should handle user with null role', (done) => {
        const userWithNullRole = { ...mockUser, role: null as any };
        mockAuthService.getProfile.and.returnValue(of(userWithNullRole));

        const result = TestBed.runInInjectionContext(() =>
          adminGuard({} as any, {} as any)
        );

        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe((canActivate) => {
            expect(canActivate).toBe(false);
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin-login']);
            done();
          });
        } else {
          fail('Expected observable result');
        }
      });

      it('should handle different admin role variations', (done) => {
        const variations = ['admin', 'ADMIN', 'Admin'];
        let completed = 0;

        variations.forEach((role, index) => {
          const adminUser = { ...mockAdminUser, role: role as any };
          mockAuthService.getProfile.and.returnValue(of(adminUser));

          const result = TestBed.runInInjectionContext(() =>
            adminGuard({} as any, {} as any)
          );

          if (typeof result === 'object' && 'subscribe' in result) {
            result.subscribe((canActivate) => {
              if (role === 'admin') {
                expect(canActivate).toBe(true);
              } else {
                expect(canActivate).toBe(false); // Only exact 'admin' should work
              }

              completed++;
              if (completed === variations.length) {
                done();
              }
            });
          }
        });
      });
    });

    describe('Error Handling', () => {
      beforeEach(() => {
        mockAuthService.isAuthenticated.and.returnValue(true);
      });

      it('should handle HTTP 403 errors', (done) => {
        const forbiddenError = { status: 403, message: 'Forbidden' };
        mockAuthService.getProfile.and.returnValue(throwError(() => forbiddenError));

        const result = TestBed.runInInjectionContext(() =>
          adminGuard({} as any, {} as any)
        );

        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe((canActivate) => {
            expect(canActivate).toBe(false);
            expect(mockAuthService.clearAuthData).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin-login']);
            done();
          });
        } else {
          fail('Expected observable result');
        }
      });

      it('should handle server errors (500)', (done) => {
        const serverError = { status: 500, message: 'Internal Server Error' };
        mockAuthService.getProfile.and.returnValue(throwError(() => serverError));

        const result = TestBed.runInInjectionContext(() =>
          adminGuard({} as any, {} as any)
        );

        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe((canActivate) => {
            expect(canActivate).toBe(false);
            expect(mockAuthService.clearAuthData).toHaveBeenCalled();
            done();
          });
        } else {
          fail('Expected observable result');
        }
      });
    });
  });

  describe('Integration Tests', () => {
    it('should work together in a complex authentication flow', (done) => {
      // Simulate a user trying to access both protected and admin routes
      mockAuthService.isAuthenticated.and.returnValue(true);
      mockAuthService.getProfile.and.returnValue(of(mockAdminUser));

      const authResult = TestBed.runInInjectionContext(() =>
        authGuard({} as any, {} as any)
      );

      if (typeof authResult === 'object' && 'subscribe' in authResult) {
        authResult.subscribe((authCanActivate) => {
          expect(authCanActivate).toBe(true);

          const adminResult = TestBed.runInInjectionContext(() =>
            adminGuard({} as any, {} as any)
          );

          if (typeof adminResult === 'object' && 'subscribe' in adminResult) {
            adminResult.subscribe((adminCanActivate) => {
              expect(adminCanActivate).toBe(true);
              done();
            });
          }
        });
      }
    });

    it('should handle rapid successive guard calls', (done) => {
      mockAuthService.isAuthenticated.and.returnValue(true);
      mockAuthService.getProfile.and.returnValue(of(mockUser));

      let completedCalls = 0;
      const totalCalls = 5;

      for (let i = 0; i < totalCalls; i++) {
        const result = TestBed.runInInjectionContext(() =>
          authGuard({} as any, {} as any)
        );

        if (typeof result === 'object' && 'subscribe' in result) {
          result.subscribe((canActivate) => {
            expect(canActivate).toBe(true);
            completedCalls++;

            if (completedCalls === totalCalls) {
              expect(mockAuthService.getProfile).toHaveBeenCalledTimes(totalCalls);
              done();
            }
          });
        }
      }
    });

    it('should handle authentication state changes during guard execution', (done) => {
      // Start as authenticated
      mockAuthService.isAuthenticated.and.returnValue(true);
      mockAuthService.getProfile.and.returnValue(of(mockUser));

      const result = TestBed.runInInjectionContext(() =>
        authGuard({} as any, {} as any)
      );

      if (typeof result === 'object' && 'subscribe' in result) {
        result.subscribe((canActivate) => {
          expect(canActivate).toBe(true);

          // Now simulate becoming unauthenticated
          mockAuthService.isAuthenticated.and.returnValue(false);

          const secondResult = TestBed.runInInjectionContext(() =>
            authGuard({} as any, {} as any)
          );

          expect(secondResult).toBe(false);
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
          done();
        });
      }
    });
  });

  describe('Edge Cases and Performance', () => {
    it('should handle memory pressure gracefully', (done) => {
      mockAuthService.isAuthenticated.and.returnValue(true);
      mockAuthService.getProfile.and.returnValue(of(mockUser));

      // Create many guard instances
      const guards = [];
      for (let i = 0; i < 100; i++) {
        const result = TestBed.runInInjectionContext(() =>
          authGuard({} as any, {} as any)
        );
        guards.push(result);
      }

      // Verify they all work
      let completed = 0;
      guards.forEach((guard) => {
        if (typeof guard === 'object' && 'subscribe' in guard) {
          guard.subscribe((canActivate) => {
            expect(canActivate).toBe(true);
            completed++;

            if (completed === guards.length) {
              done();
            }
          });
        }
      });
    });

    it('should handle concurrent authentication checks', (done) => {
      mockAuthService.isAuthenticated.and.returnValue(true);
      mockAuthService.getProfile.and.returnValue(of(mockAdminUser));

      let authCompleted = 0;
      let adminCompleted = 0;

      // Run both guards concurrently
      const authResult = TestBed.runInInjectionContext(() =>
        authGuard({} as any, {} as any)
      );

      const adminResult = TestBed.runInInjectionContext(() =>
        adminGuard({} as any, {} as any)
      );

      if (typeof authResult === 'object' && 'subscribe' in authResult) {
        authResult.subscribe((canActivate) => {
          expect(canActivate).toBe(true);
          authCompleted = 1;

          if (authCompleted && adminCompleted) {
            done();
          }
        });
      }

      if (typeof adminResult === 'object' && 'subscribe' in adminResult) {
        adminResult.subscribe((canActivate) => {
          expect(canActivate).toBe(true);
          adminCompleted = 1;

          if (authCompleted && adminCompleted) {
            done();
          }
        });
      }
    });
  });
});
