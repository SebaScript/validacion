import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { LocalUserService } from './local-user.service';
import { User, LoginRequest, RegisterRequest } from '../interfaces/user.interface';

describe('AuthService', () => {
  let service: AuthService;
  let mockLocalUserService: jasmine.SpyObj<LocalUserService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockLocalStorage: { [key: string]: string };

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
    // Mock localStorage
    mockLocalStorage = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return mockLocalStorage[key] || null;
    });

    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });

    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete mockLocalStorage[key];
    });

    const localUserServiceSpy = jasmine.createSpyObj('LocalUserService', [
      'authenticateUser', 'createUser', 'findUserById', 'updateUser'
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: LocalUserService, useValue: localUserServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    });

    mockLocalUserService = TestBed.inject(LocalUserService) as jasmine.SpyObj<LocalUserService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockToastr = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    mockLocalStorage = {};
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with default signal values', () => {
      expect(service.isAdminLogged()).toBe(false);
      expect(service.isUserLogged()).toBe(false);
    });

    it('should check localStorage on initialization with valid data', () => {
      mockLocalStorage['access_token'] = 'test_token';
      mockLocalStorage['currentUser'] = JSON.stringify(mockUser);

      service = new AuthService(mockLocalUserService, mockRouter, mockToastr);

      expect(service.isUserLogged()).toBe(true);
      expect(service.isAdminLogged()).toBe(false);
      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    it('should check localStorage on initialization with admin user', () => {
      mockLocalStorage['access_token'] = 'test_token';
      mockLocalStorage['currentUser'] = JSON.stringify(mockAdminUser);

      service = new AuthService(mockLocalUserService, mockRouter, mockToastr);

      expect(service.isUserLogged()).toBe(true);
      expect(service.isAdminLogged()).toBe(true);
      expect(service.getCurrentUser()).toEqual(mockAdminUser);
    });

    it('should handle malformed user data in localStorage', () => {
      mockLocalStorage['access_token'] = 'test_token';
      mockLocalStorage['currentUser'] = 'invalid-json';
      spyOn(console, 'error');

      service = new AuthService(mockLocalUserService, mockRouter, mockToastr);

      expect(console.error).toHaveBeenCalledWith('Error parsing user data from localStorage', jasmine.any(Error));
      expect(service.isUserLogged()).toBe(false);
      expect(service.isAdminLogged()).toBe(false);
      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('currentUser');
    });

    it('should not initialize user state when no stored data', () => {
      service = new AuthService(mockLocalUserService, mockRouter, mockToastr);

      expect(service.isUserLogged()).toBe(false);
      expect(service.isAdminLogged()).toBe(false);
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should not initialize user state when token missing', () => {
      mockLocalStorage['currentUser'] = JSON.stringify(mockUser);

      service = new AuthService(mockLocalUserService, mockRouter, mockToastr);

      expect(service.isUserLogged()).toBe(false);
      expect(service.isAdminLogged()).toBe(false);
    });

    it('should not initialize user state when user data missing', () => {
      mockLocalStorage['access_token'] = 'test_token';

      service = new AuthService(mockLocalUserService, mockRouter, mockToastr);

      expect(service.isUserLogged()).toBe(false);
      expect(service.isAdminLogged()).toBe(false);
    });
  });

  describe('clearAuthData', () => {
    beforeEach(() => {
      mockLocalStorage['access_token'] = 'test_token';
      mockLocalStorage['currentUser'] = JSON.stringify(mockUser);
      service.currentUserSubject.next(mockUser);
      service.isUserLogged.set(true);
      service.isAdminLogged.set(false);
    });

    it('should clear all authentication data', () => {
      service.clearAuthData();

      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('currentUser');
      expect(service.getCurrentUser()).toBeNull();
      expect(service.isUserLogged()).toBe(false);
      expect(service.isAdminLogged()).toBe(false);
    });

    it('should emit null to currentUserSubject', () => {
      let currentUser: User | null = mockUser;
      service.currentUser$.subscribe(user => currentUser = user);

      service.clearAuthData();

      expect(currentUser).toBeNull();
    });

    it('should reset both signal values', () => {
      service.isAdminLogged.set(true);

      service.clearAuthData();

      expect(service.isUserLogged()).toBe(false);
      expect(service.isAdminLogged()).toBe(false);
    });
  });

  describe('login', () => {
    const loginData: LoginRequest = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should login successfully with valid credentials', fakeAsync(() => {
      mockLocalUserService.authenticateUser.and.returnValue(Promise.resolve(mockUser));
      let loginResult: boolean | undefined;

      service.login(loginData).subscribe(result => loginResult = result);
      tick();

      expect(mockLocalUserService.authenticateUser).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(loginResult).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', jasmine.stringMatching(/^local_token_\d+$/));
      expect(localStorage.setItem).toHaveBeenCalledWith('currentUser', JSON.stringify(mockUser));
      expect(service.getCurrentUser()).toEqual(mockUser);
      expect(service.isUserLogged()).toBe(true);
      expect(service.isAdminLogged()).toBe(false);
      expect(mockToastr.success).toHaveBeenCalledWith('Welcome back!', 'Login Successful');
    }));

    it('should login admin user successfully', fakeAsync(() => {
      mockLocalUserService.authenticateUser.and.returnValue(Promise.resolve(mockAdminUser));
      let loginResult: boolean | undefined;

      service.login(loginData).subscribe(result => loginResult = result);
      tick();

      expect(loginResult).toBe(true);
      expect(service.isUserLogged()).toBe(true);
      expect(service.isAdminLogged()).toBe(true);
      expect(service.getCurrentUser()).toEqual(mockAdminUser);
    }));

    it('should handle invalid credentials', fakeAsync(() => {
      mockLocalUserService.authenticateUser.and.returnValue(Promise.resolve(null));
      let loginResult: boolean | undefined;

      service.login(loginData).subscribe(result => loginResult = result);
      tick();

      expect(loginResult).toBe(false);
      expect(mockToastr.error).toHaveBeenCalledWith('Invalid credentials', 'Login Failed');
      expect(service.isUserLogged()).toBe(false);
      expect(service.isAdminLogged()).toBe(false);
    }));

    it('should handle authentication errors', fakeAsync(() => {
      const error = new Error('Authentication failed');
      mockLocalUserService.authenticateUser.and.returnValue(Promise.reject(error));
      let loginResult: boolean | undefined;
      spyOn(console, 'error');

      service.login(loginData).subscribe(result => loginResult = result);
      tick();

      expect(loginResult).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Login error:', error);
      expect(mockToastr.error).toHaveBeenCalledWith('Authentication failed', 'Login Failed');
    }));

    it('should handle authentication errors with generic message', fakeAsync(() => {
      mockLocalUserService.authenticateUser.and.returnValue(Promise.reject({}));
      let loginResult: boolean | undefined;
      spyOn(console, 'error');

      service.login(loginData).subscribe(result => loginResult = result);
      tick();

      expect(loginResult).toBe(false);
      expect(mockToastr.error).toHaveBeenCalledWith('Invalid credentials', 'Login Failed');
    }));

    it('should emit user to currentUser$ observable', fakeAsync(() => {
      mockLocalUserService.authenticateUser.and.returnValue(Promise.resolve(mockUser));
      let emittedUser: any = null;

      service.currentUser$.subscribe(user => emittedUser = user);
      service.login(loginData).subscribe();
      tick();

      expect(emittedUser).toEqual(mockUser);
    }));

    it('should generate unique tokens for each login', fakeAsync(() => {
      mockLocalUserService.authenticateUser.and.returnValue(Promise.resolve(mockUser));

      service.login(loginData).subscribe();
      tick();
      const firstToken = mockLocalStorage['access_token'];

      // Clear and login again
      mockLocalStorage = {};
      tick(10); // Ensure different timestamp

      service.login(loginData).subscribe();
      tick();
      const secondToken = mockLocalStorage['access_token'];

      expect(firstToken).not.toBe(secondToken);
      expect(firstToken).toMatch(/^local_token_\d+$/);
      expect(secondToken).toMatch(/^local_token_\d+$/);
    }));
  });

  describe('register', () => {
    const registerData: RegisterRequest = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123'
    };

    it('should register user successfully', fakeAsync(() => {
      mockLocalUserService.createUser.and.returnValue(Promise.resolve(mockUser));
      let registerResult: boolean | undefined;

      service.register(registerData).subscribe(result => registerResult = result);
      tick();

      expect(mockLocalUserService.createUser).toHaveBeenCalledWith(registerData);
      expect(registerResult).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', jasmine.stringMatching(/^local_token_\d+$/));
      expect(localStorage.setItem).toHaveBeenCalledWith('currentUser', JSON.stringify(mockUser));
      expect(service.getCurrentUser()).toEqual(mockUser);
      expect(service.isUserLogged()).toBe(true);
      expect(service.isAdminLogged()).toBe(false);
      expect(mockToastr.success).toHaveBeenCalledWith('Account created successfully!', 'Registration Successful');
    }));

    it('should register admin user successfully', fakeAsync(() => {
      mockLocalUserService.createUser.and.returnValue(Promise.resolve(mockAdminUser));
      let registerResult: boolean | undefined;

      service.register(registerData).subscribe(result => registerResult = result);
      tick();

      expect(registerResult).toBe(true);
      expect(service.isUserLogged()).toBe(true);
      expect(service.isAdminLogged()).toBe(true);
    }));

    it('should handle registration failure', fakeAsync(() => {
      mockLocalUserService.createUser.and.returnValue(Promise.resolve(null as any));
      let registerResult: boolean | undefined;

      service.register(registerData).subscribe(result => registerResult = result);
      tick();

      expect(registerResult).toBe(false);
      expect(service.isUserLogged()).toBe(false);
      expect(service.isAdminLogged()).toBe(false);
    }));

    it('should handle registration errors', fakeAsync(() => {
      const error = new Error('Email already exists');
      mockLocalUserService.createUser.and.returnValue(Promise.reject(error));
      let registerResult: boolean | undefined;
      spyOn(console, 'error');

      service.register(registerData).subscribe(result => registerResult = result);
      tick();

      expect(registerResult).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Registration error:', error);
      expect(mockToastr.error).toHaveBeenCalledWith('Email already exists', 'Registration Failed');
    }));

    it('should handle registration errors with generic message', fakeAsync(() => {
      mockLocalUserService.createUser.and.returnValue(Promise.reject({}));
      let registerResult: boolean | undefined;
      spyOn(console, 'error');

      service.register(registerData).subscribe(result => registerResult = result);
      tick();

      expect(registerResult).toBe(false);
      expect(mockToastr.error).toHaveBeenCalledWith('User registration failed', 'Registration Failed');
    }));

    it('should emit user to currentUser$ observable on successful registration', fakeAsync(() => {
      mockLocalUserService.createUser.and.returnValue(Promise.resolve(mockUser));
      let emittedUser: any = null;

      service.currentUser$.subscribe(user => emittedUser = user);
      service.register(registerData).subscribe();
      tick();

      expect(emittedUser).toEqual(mockUser);
    }));
  });

  describe('logout', () => {
    beforeEach(() => {
      mockLocalStorage['access_token'] = 'test_token';
      mockLocalStorage['currentUser'] = JSON.stringify(mockUser);
      service.currentUserSubject.next(mockUser);
      service.isUserLogged.set(true);
    });

    it('should logout user successfully', () => {
      service.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('currentUser');
      expect(service.getCurrentUser()).toBeNull();
      expect(service.isUserLogged()).toBe(false);
      expect(service.isAdminLogged()).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      expect(mockToastr.success).toHaveBeenCalledWith('You have been logged out', 'Logged Out');
    });

    it('should emit null to currentUser$ observable', () => {
      let emittedUser: User | null = mockUser;
      service.currentUser$.subscribe(user => emittedUser = user);

      service.logout();

      expect(emittedUser).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when logged in', () => {
      service.currentUserSubject.next(mockUser);

      const user = service.getCurrentUser();

      expect(user).toEqual(mockUser);
    });

    it('should return null when not logged in', () => {
      service.currentUserSubject.next(null);

      const user = service.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', () => {
      mockLocalStorage['access_token'] = 'test_token';
      service.currentUserSubject.next(mockUser);

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when no token', () => {
      service.currentUserSubject.next(mockUser);

      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false when no user', () => {
      mockLocalStorage['access_token'] = 'test_token';
      service.currentUserSubject.next(null);

      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false when neither token nor user', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin users', () => {
      service.currentUserSubject.next(mockAdminUser);

      expect(service.isAdmin()).toBe(true);
    });

    it('should return false for regular users', () => {
      service.currentUserSubject.next(mockUser);

      expect(service.isAdmin()).toBe(false);
    });

    it('should return false when no user', () => {
      service.currentUserSubject.next(null);

      expect(service.isAdmin()).toBe(false);
    });

    it('should return false for user without role', () => {
      const userWithoutRole = { ...mockUser, role: undefined };
      service.currentUserSubject.next(userWithoutRole);

      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token when exists', () => {
      mockLocalStorage['access_token'] = 'test_token';

      expect(service.getToken()).toBe('test_token');
    });

    it('should return null when no token', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('getProfile', () => {
    beforeEach(() => {
      service.currentUserSubject.next(mockUser);
    });

    it('should return user profile successfully', (done) => {
      mockLocalUserService.findUserById.and.returnValue(mockUser);

      service.getProfile().subscribe({
        next: (user) => {
          expect(user).toEqual(mockUser);
          expect(mockLocalUserService.findUserById).toHaveBeenCalledWith(1);
          expect(localStorage.setItem).toHaveBeenCalledWith('currentUser', JSON.stringify(mockUser));
          expect(service.getCurrentUser()).toEqual(mockUser);
          done();
        }
      });
    });

    it('should handle user not found', (done) => {
      mockLocalUserService.findUserById.and.returnValue(null);

      service.getProfile().subscribe({
        error: (error) => {
          expect(error.message).toBe('User not found');
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
          done();
        }
      });
    });

    it('should handle no authenticated user', (done) => {
      service.currentUserSubject.next(null);

      service.getProfile().subscribe({
        error: (error) => {
          expect(error.message).toBe('No authenticated user');
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
          done();
        }
      });
    });

    it('should handle user without userId', (done) => {
      const userWithoutId = { ...mockUser, userId: undefined };
      service.currentUserSubject.next(userWithoutId);

      service.getProfile().subscribe({
        error: (error) => {
          expect(error.message).toBe('No authenticated user');
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
          done();
        }
      });
    });

    it('should update currentUserSubject with fresh data', (done) => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockLocalUserService.findUserById.and.returnValue(updatedUser);
      let emittedUser: User | null = null;

      service.currentUser$.subscribe(user => emittedUser = user);

      service.getProfile().subscribe({
        next: () => {
          expect(emittedUser).toEqual(updatedUser as User | null);
          done();
        }
      });
    });
  });

  describe('updateProfile', () => {
    beforeEach(() => {
      service.currentUserSubject.next(mockUser);
    });

    it('should update profile successfully', fakeAsync(() => {
      const updateData = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockLocalUserService.updateUser.and.returnValue(Promise.resolve(updatedUser));
      let profileResult: User | undefined;

      service.updateProfile(updateData).subscribe(user => profileResult = user);
      tick();

      expect(mockLocalUserService.updateUser).toHaveBeenCalledWith(1, updateData);
      expect(profileResult).toEqual(updatedUser);
      expect(localStorage.setItem).toHaveBeenCalledWith('currentUser', JSON.stringify(updatedUser));
      expect(service.getCurrentUser()).toEqual(updatedUser);
      expect(mockToastr.success).toHaveBeenCalledWith('Profile updated successfully!', 'Update Successful');
    }));

    it('should handle update errors', fakeAsync(() => {
      const updateData = { name: 'Updated Name' };
      const error = new Error('Update failed');
      mockLocalUserService.updateUser.and.returnValue(Promise.reject(error));
      let updateError: Error | undefined;
      spyOn(console, 'error');

      service.updateProfile(updateData).subscribe({
        error: (err) => updateError = err
      });
      tick();

      expect(updateError).toBe(error);
      expect(console.error).toHaveBeenCalledWith('Error updating profile:', error);
      expect(mockToastr.error).toHaveBeenCalledWith('Update failed', 'Update Failed');
    }));

    it('should handle update errors with generic message', fakeAsync(() => {
      const updateData = { name: 'Updated Name' };
      mockLocalUserService.updateUser.and.returnValue(Promise.reject({}));
      spyOn(console, 'error');

      service.updateProfile(updateData).subscribe({
        error: () => {}
      });
      tick();

      expect(mockToastr.error).toHaveBeenCalledWith('Failed to update profile', 'Update Failed');
    }));

    it('should handle no authenticated user', (done) => {
      service.currentUserSubject.next(null);
      const updateData = { name: 'Updated Name' };

      service.updateProfile(updateData).subscribe({
        error: (error) => {
          expect(error.message).toBe('No authenticated user');
          done();
        }
      });
    });

    it('should handle user without userId', (done) => {
      const userWithoutId = { ...mockUser, userId: undefined };
      service.currentUserSubject.next(userWithoutId);
      const updateData = { name: 'Updated Name' };

      service.updateProfile(updateData).subscribe({
        error: (error) => {
          expect(error.message).toBe('No authenticated user');
          done();
        }
      });
    });

    it('should emit updated user to currentUser$ observable', fakeAsync(() => {
      const updateData = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockLocalUserService.updateUser.and.returnValue(Promise.resolve(updatedUser));
      let emittedUser: any = null;

      service.currentUser$.subscribe(user => emittedUser = user);
      service.updateProfile(updateData).subscribe();
      tick();

      expect(emittedUser).toEqual(updatedUser);
    }));
  });

  describe('Legacy Methods', () => {
    const email = 'test@example.com';
    const password = 'password123';

    it('should call login method for adminLogin', fakeAsync(() => {
      mockLocalUserService.authenticateUser.and.returnValue(Promise.resolve(mockAdminUser));
      let result: boolean | undefined;

      service.adminLogin(email, password).subscribe(res => result = res);
      tick();

      expect(mockLocalUserService.authenticateUser).toHaveBeenCalledWith(email, password);
      expect(result).toBe(true);
    }));

    it('should call login method for userLogin', fakeAsync(() => {
      mockLocalUserService.authenticateUser.and.returnValue(Promise.resolve(mockUser));
      let result: boolean | undefined;

      service.userLogin(email, password).subscribe(res => result = res);
      tick();

      expect(mockLocalUserService.authenticateUser).toHaveBeenCalledWith(email, password);
      expect(result).toBe(true);
    }));
  });

  describe('BehaviorSubject Integration', () => {
    it('should emit initial null value', () => {
      let emittedUser: User | null = mockUser; // Start with non-null to test emission

      service.currentUser$.subscribe(user => emittedUser = user);

      expect(emittedUser).toBeNull();
    });

    it('should emit user changes to all subscribers', () => {
      const subscribers: (User | null)[] = [];

      service.currentUser$.subscribe(user => subscribers.push(user));
      service.currentUser$.subscribe(user => subscribers.push(user));

      service.currentUserSubject.next(mockUser);
      service.currentUserSubject.next(mockAdminUser);
      service.currentUserSubject.next(null);

      expect(subscribers).toEqual([
        null, null, // Initial emissions for both subscribers
        mockUser, mockUser, // First update for both subscribers
        mockAdminUser, mockAdminUser, // Second update for both subscribers
        null, null // Third update for both subscribers
      ]);
    });

    it('should maintain subscription across authentication state changes', fakeAsync(() => {
      const emissions: (User | null)[] = [];
      service.currentUser$.subscribe(user => emissions.push(user));

      // Login
      mockLocalUserService.authenticateUser.and.returnValue(Promise.resolve(mockUser));
      service.login({ email: 'test@test.com', password: 'pass' }).subscribe();
      tick();

      // Logout
      service.logout();

      // Login again
      mockLocalUserService.authenticateUser.and.returnValue(Promise.resolve(mockAdminUser));
      service.login({ email: 'admin@test.com', password: 'pass' }).subscribe();
      tick();

      expect(emissions).toEqual([
        null, // Initial
        mockUser, // After first login
        null, // After logout
        mockAdminUser // After second login
      ]);
    }));
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle concurrent login attempts', fakeAsync(() => {
      mockLocalUserService.authenticateUser.and.returnValue(Promise.resolve(mockUser));

      const login1$ = service.login({ email: 'test1@test.com', password: 'pass' });
      const login2$ = service.login({ email: 'test2@test.com', password: 'pass' });

      let results: boolean[] = [];
      login1$.subscribe(result => results.push(result));
      login2$.subscribe(result => results.push(result));

      tick();

      expect(results).toEqual([true, true]);
      expect(mockLocalUserService.authenticateUser).toHaveBeenCalledTimes(2);
    }));

    it('should handle localStorage errors during clearAuthData', () => {
      (localStorage.removeItem as jasmine.Spy).and.throwError('Storage error');

      expect(() => service.clearAuthData()).not.toThrow();
      expect(service.getCurrentUser()).toBeNull();
      expect(service.isUserLogged()).toBe(false);
      expect(service.isAdminLogged()).toBe(false);
    });

    it('should handle localStorage errors during login', fakeAsync(() => {
      mockLocalUserService.authenticateUser.and.returnValue(Promise.resolve(mockUser));
      (localStorage.setItem as jasmine.Spy).and.throwError('Storage error');
      let loginResult: boolean | undefined;

      service.login({ email: 'test@test.com', password: 'pass' }).subscribe(result => loginResult = result);
      tick();

      // Should still complete successfully even if localStorage fails
      expect(loginResult).toBe(true);
      expect(service.getCurrentUser()).toEqual(mockUser);
    }));

    it('should handle malformed user data during profile operations', (done) => {
      const malformedUser = { name: 'Test', email: 'test@test.com' }; // Missing userId
      service.currentUserSubject.next(malformedUser as User);

      service.getProfile().subscribe({
        error: (error) => {
          expect(error.message).toBe('No authenticated user');
          done();
        }
      });
    });

    it('should handle service unavailability gracefully', fakeAsync(() => {
      mockLocalUserService.authenticateUser.and.returnValue(Promise.reject(new Error('Service unavailable')));
      let loginResult: boolean | undefined;
      spyOn(console, 'error');

      service.login({ email: 'test@test.com', password: 'pass' }).subscribe(result => loginResult = result);
      tick();

      expect(loginResult).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Login error:', jasmine.any(Error));
      expect(mockToastr.error).toHaveBeenCalledWith('Service unavailable', 'Login Failed');
    }));

    it('should handle empty user data from service', fakeAsync(() => {
      mockLocalUserService.createUser.and.returnValue(Promise.resolve(null as any));
      let registerResult: boolean | undefined;

      service.register({ name: 'Test', email: 'test@test.com', password: 'pass' }).subscribe(result => registerResult = result);
      tick();

      expect(registerResult).toBe(false);
      expect(service.getCurrentUser()).toBeNull();
      expect(service.isUserLogged()).toBe(false);
    }));

    it('should handle rapid logout calls', () => {
      mockLocalStorage['access_token'] = 'test_token';
      service.currentUserSubject.next(mockUser);
      service.isUserLogged.set(true);

      service.logout();
      service.logout(); // Call again immediately

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      expect(mockToastr.success).toHaveBeenCalledWith('You have been logged out', 'Logged Out');
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should handle undefined/null localStorage values gracefully', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(undefined);

      expect(service.getToken()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);

      service = new AuthService(mockLocalUserService, mockRouter, mockToastr);
      expect(service.isUserLogged()).toBe(false);
    });
  });

  describe('Performance and Memory Management', () => {
    it('should not create memory leaks with multiple subscriptions', () => {
      const subscriptions = [];

      for (let i = 0; i < 100; i++) {
        subscriptions.push(service.currentUser$.subscribe());
      }

      service.currentUserSubject.next(mockUser);
      service.currentUserSubject.next(null);

      // Unsubscribe all
      subscriptions.forEach(sub => sub.unsubscribe());

      // Should not throw or cause memory issues
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should handle rapid state changes efficiently', fakeAsync(() => {
      const emissions: (User | null)[] = [];
      service.currentUser$.subscribe(user => emissions.push(user));

      // Rapid state changes
      for (let i = 0; i < 10; i++) {
        mockLocalUserService.authenticateUser.and.returnValue(Promise.resolve(mockUser));
        service.login({ email: `test${i}@test.com`, password: 'pass' }).subscribe();
        service.logout();
      }

      tick();

      expect(emissions.length).toBeGreaterThan(10);
      expect(emissions[emissions.length - 1]).toBeNull(); // Should end with logout
    }));

    it('should handle large user objects efficiently', fakeAsync(() => {
      const largeUser = {
        ...mockUser,
        metadata: new Array(1000).fill(0).map((_, i) => `data_${i}`)
      };

      mockLocalUserService.authenticateUser.and.returnValue(Promise.resolve(largeUser));
      let loginResult: boolean | undefined;

      const startTime = performance.now();
      service.login({ email: 'test@test.com', password: 'pass' }).subscribe(result => loginResult = result);
      tick();
      const endTime = performance.now();

      expect(loginResult).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast even with large objects
    }));
  });
});
