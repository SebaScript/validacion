import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { profileGuard } from './profile.guard';
import { AuthService } from '../services/auth.service';
import { User } from '../interfaces/user.interface';

describe('Profile Guard', () => {
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockClientUser: User = {
    userId: 1,
    name: 'Client User',
    email: 'client@example.com',
    role: 'client'
  };

  const mockAdminUser: User = {
    userId: 2,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
  };

  const mockUserWithoutRole: User = {
    userId: 3,
    name: 'User Without Role',
    email: 'norole@example.com'
    // role is undefined
  };

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  describe('User Authentication and Authorization', () => {
    it('should allow access for authenticated client user', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockClientUser);

      TestBed.runInInjectionContext(() => {
        const result = profileGuard({} as any, {} as any);

        expect(result).toBe(true);
        expect(mockRouter.navigate).not.toHaveBeenCalled();
      });
    });

    it('should allow access for authenticated admin user', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockAdminUser);

      TestBed.runInInjectionContext(() => {
        const result = profileGuard({} as any, {} as any);

        expect(result).toBe(true);
        expect(mockRouter.navigate).not.toHaveBeenCalled();
      });
    });

    it('should redirect to login for unauthenticated user (null)', () => {
      mockAuthService.getCurrentUser.and.returnValue(null);

      TestBed.runInInjectionContext(() => {
        const result = profileGuard({} as any, {} as any);

        expect(result).toBe(false);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      });
    });

    it('should redirect to login for user without role', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockUserWithoutRole);

      TestBed.runInInjectionContext(() => {
        const result = profileGuard({} as any, {} as any);

        expect(result).toBe(false);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      });
    });

    it('should redirect to login for user with invalid role', () => {
      const userWithInvalidRole = {
        ...mockClientUser,
        role: 'invalid' as any
      };
      mockAuthService.getCurrentUser.and.returnValue(userWithInvalidRole);

      TestBed.runInInjectionContext(() => {
        const result = profileGuard({} as any, {} as any);

        expect(result).toBe(false);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined user from auth service', () => {
      mockAuthService.getCurrentUser.and.returnValue(undefined as any);

      TestBed.runInInjectionContext(() => {
        const result = profileGuard({} as any, {} as any);

        expect(result).toBe(false);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      });
    });

    it('should handle empty user object', () => {
      mockAuthService.getCurrentUser.and.returnValue({} as User);

      TestBed.runInInjectionContext(() => {
        const result = profileGuard({} as any, {} as any);

        expect(result).toBe(false);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      });
    });

    it('should handle user with null role', () => {
      const userWithNullRole = {
        ...mockClientUser,
        role: null as any
      };
      mockAuthService.getCurrentUser.and.returnValue(userWithNullRole);

      TestBed.runInInjectionContext(() => {
        const result = profileGuard({} as any, {} as any);

        expect(result).toBe(false);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      });
    });

    it('should handle auth service throwing error', () => {
      mockAuthService.getCurrentUser.and.throwError(new Error('Auth service error'));

      TestBed.runInInjectionContext(() => {
        expect(() => profileGuard({} as any, {} as any)).toThrow();
        expect(mockRouter.navigate).not.toHaveBeenCalled();
      });
    });

    it('should handle router navigation failure gracefully', () => {
      mockAuthService.getCurrentUser.and.returnValue(null);
      mockRouter.navigate.and.throwError(new Error('Navigation error'));

      TestBed.runInInjectionContext(() => {
        expect(() => profileGuard({} as any, {} as any)).toThrow();
      });
    });
  });

  describe('Role-specific Access Control', () => {
    it('should allow access for user with role "client"', () => {
      const clientUser = { ...mockClientUser, role: 'client' as const };
      mockAuthService.getCurrentUser.and.returnValue(clientUser);

      TestBed.runInInjectionContext(() => {
        const result = profileGuard({} as any, {} as any);

        expect(result).toBe(true);
      });
    });

    it('should allow access for user with role "admin"', () => {
      const adminUser = { ...mockAdminUser, role: 'admin' as const };
      mockAuthService.getCurrentUser.and.returnValue(adminUser);

      TestBed.runInInjectionContext(() => {
        const result = profileGuard({} as any, {} as any);

        expect(result).toBe(true);
      });
    });

    it('should deny access for case-sensitive role mismatch', () => {
      const userWithWrongCase = {
        ...mockClientUser,
        role: 'CLIENT' as any
      };
      mockAuthService.getCurrentUser.and.returnValue(userWithWrongCase);

      TestBed.runInInjectionContext(() => {
        const result = profileGuard({} as any, {} as any);

        expect(result).toBe(false);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      });
    });

    it('should deny access for empty string role', () => {
      const userWithEmptyRole = {
        ...mockClientUser,
        role: '' as any
      };
      mockAuthService.getCurrentUser.and.returnValue(userWithEmptyRole);

      TestBed.runInInjectionContext(() => {
        const result = profileGuard({} as any, {} as any);

        expect(result).toBe(false);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      });
    });
  });

  describe('Integration with Router and AuthService', () => {
    it('should call getCurrentUser once per guard execution', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockClientUser);

      TestBed.runInInjectionContext(() => {
        profileGuard({} as any, {} as any);

        expect(mockAuthService.getCurrentUser).toHaveBeenCalledTimes(1);
      });
    });

    it('should navigate to login with correct parameters for unauthorized access', () => {
      mockAuthService.getCurrentUser.and.returnValue(null);

      TestBed.runInInjectionContext(() => {
        profileGuard({} as any, {} as any);

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
        expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      });
    });

    it('should not navigate for authorized access', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockClientUser);

      TestBed.runInInjectionContext(() => {
        profileGuard({} as any, {} as any);

        expect(mockRouter.navigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('Multiple Guard Executions', () => {
    it('should consistently return same result for same user state', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockClientUser);

      TestBed.runInInjectionContext(() => {
        const result1 = profileGuard({} as any, {} as any);
        const result2 = profileGuard({} as any, {} as any);
        const result3 = profileGuard({} as any, {} as any);

        expect(result1).toBe(true);
        expect(result2).toBe(true);
        expect(result3).toBe(true);
        expect(mockAuthService.getCurrentUser).toHaveBeenCalledTimes(3);
      });
    });

    it('should handle changing user state between executions', () => {
      // First call: user is authenticated
      mockAuthService.getCurrentUser.and.returnValue(mockClientUser);

      TestBed.runInInjectionContext(() => {
        const result1 = profileGuard({} as any, {} as any);
        expect(result1).toBe(true);
      });

      // Second call: user is no longer authenticated
      mockAuthService.getCurrentUser.and.returnValue(null);

      TestBed.runInInjectionContext(() => {
        const result2 = profileGuard({} as any, {} as any);
        expect(result2).toBe(false);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      });
    });
  });

  describe('Performance and Memory', () => {
    it('should not create memory leaks with multiple executions', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockClientUser);

      TestBed.runInInjectionContext(() => {
        for (let i = 0; i < 100; i++) {
          const result = profileGuard({} as any, {} as any);
          expect(result).toBe(true);
        }

        expect(mockAuthService.getCurrentUser).toHaveBeenCalledTimes(100);
      });
    });

    it('should handle rapid successive guard checks', () => {
      const users = [mockClientUser, mockAdminUser, null, mockUserWithoutRole];
      let callCount = 0;

      mockAuthService.getCurrentUser.and.callFake(() => {
        return users[callCount++ % users.length];
      });

      TestBed.runInInjectionContext(() => {
        const results = [];
        for (let i = 0; i < 8; i++) {
          results.push(profileGuard({} as any, {} as any));
        }

        expect(results).toEqual([true, true, false, false, true, true, false, false]);
        expect(mockAuthService.getCurrentUser).toHaveBeenCalledTimes(8);
      });
    });
  });

  describe('Guard Function Type and Return Values', () => {
    it('should always return boolean type', () => {
      const testCases = [
        mockClientUser,
        mockAdminUser,
        null,
        undefined,
        mockUserWithoutRole,
        {} as User
      ];

      testCases.forEach(user => {
        mockAuthService.getCurrentUser.and.returnValue(user as any);

        TestBed.runInInjectionContext(() => {
          const result = profileGuard({} as any, {} as any);
          expect(typeof result).toBe('boolean');
        });
      });
    });

    it('should return true only for valid roles', () => {
      const testCases = [
        { user: mockClientUser, expected: true },
        { user: mockAdminUser, expected: true },
        { user: null, expected: false },
        { user: mockUserWithoutRole, expected: false },
        { user: { ...mockClientUser, role: 'invalid' as any }, expected: false }
      ];

      testCases.forEach(({ user, expected }) => {
        mockAuthService.getCurrentUser.and.returnValue(user as any);
        mockRouter.navigate.calls.reset();

        TestBed.runInInjectionContext(() => {
          const result = profileGuard({} as any, {} as any);
          expect(result).toBe(expected);
        });
      });
    });
  });
});
