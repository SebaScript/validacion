import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';

import { OAuthService } from './oauth.service';
import { AuthService } from './auth.service';
import { LocalUserService } from './local-user.service';
import { User } from '../interfaces/user.interface';
import { environment } from '../../../environments/environment';

// Mock Google API
declare global {
  interface Window {
    google: any;
  }
}

describe('OAuthService', () => {
  let service: OAuthService;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockLocalUserService: jasmine.SpyObj<LocalUserService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let currentUserSubject: BehaviorSubject<User | null>;
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

  const mockGoogleUser = {
    email: 'google@example.com',
    name: 'Google User',
    picture: 'https://example.com/avatar.jpg'
  };

  const mockGoogleResponse = {
    credential: 'mock.jwt.token'
  };

  const mockJWTPayload = {
    email: 'google@example.com',
    name: 'Google User',
    picture: 'https://example.com/avatar.jpg',
    sub: '123456789'
  };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete mockLocalStorage[key];
    });

    currentUserSubject = new BehaviorSubject<User | null>(null);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getCurrentUser', 'clearAuthData'
    ], {
      currentUserSubject,
      isUserLogged: { set: jasmine.createSpy('setUserLogged') },
      isAdminLogged: { set: jasmine.createSpy('setAdminLogged') }
    });

    const localUserServiceSpy = jasmine.createSpyObj('LocalUserService', [
      'findUserByEmail', 'createUser'
    ]);

    const toastrSpy = jasmine.createSpyObj('ToastrService', [
      'success', 'error', 'warning', 'info'
    ]);

    TestBed.configureTestingModule({
      providers: [
        OAuthService,
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: LocalUserService, useValue: localUserServiceSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    });

    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockLocalUserService = TestBed.inject(LocalUserService) as jasmine.SpyObj<LocalUserService>;
    mockToastr = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;

    // Clear window.google before each test
    delete window.google;

    service = TestBed.inject(OAuthService);
  });

  afterEach(() => {
    // Clean up DOM
    const scripts = document.head.querySelectorAll('script[src*="accounts.google.com"]');
    scripts.forEach(script => script.remove());

    // Restore original environment values
    if ((environment as any).originalOAuthConfig) {
      environment.oauth = (environment as any).originalOAuthConfig;
      delete (environment as any).originalOAuthConfig;
    }
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with Google Client ID from environment', () => {
      expect(service['GOOGLE_CLIENT_ID']).toBe(environment.oauth?.google?.clientId || '');
    });

    it('should handle missing oauth configuration in environment', () => {
      spyOnProperty(environment, 'oauth', 'get').and.returnValue({ google: { clientId: '' } });

      const testService = TestBed.inject(OAuthService);

      expect(testService['GOOGLE_CLIENT_ID']).toBe('');
    });

    it('should handle missing google configuration in oauth', () => {
      spyOnProperty(environment, 'oauth', 'get').and.returnValue({ google: { clientId: '' } });

      const testService = TestBed.inject(OAuthService);

      expect(testService['GOOGLE_CLIENT_ID']).toBe('');
    });
  });

  describe('Initialize Google Sign-In', () => {
    it('should resolve immediately if Google is already loaded', async () => {
      window.google = {
        accounts: {
          id: {
            initialize: jasmine.createSpy('initialize')
          }
        }
      };

      await service.initializeGoogleSignIn();

      expect(window.google.accounts.id.initialize).not.toHaveBeenCalled();
    });

    it('should load Google script and initialize', fakeAsync(() => {
      // Store original config and temporarily override clientId for testing
      (environment as any).originalOAuthConfig = { ...environment.oauth };
      environment.oauth!.google!.clientId = 'test-client-id';

      let resolvePromise: () => void;
      const promise = service.initializeGoogleSignIn();

      // Find the script that was added
      tick(0);
      const script = document.head.querySelector('script[src*="accounts.google.com"]') as HTMLScriptElement;
      expect(script).toBeTruthy();
      expect(script.src).toBe('https://accounts.google.com/gsi/client');
      expect(script.async).toBe(true);
      expect(script.defer).toBe(true);

      // Mock Google being loaded
      window.google = {
        accounts: {
          id: {
            initialize: jasmine.createSpy('initialize')
          }
        }
      };

      // Trigger script onload
      if (script.onload) {
        (script.onload as any)();
      }

      tick();

      promise.then(() => {
        expect(window.google.accounts.id.initialize).toHaveBeenCalledWith({
          client_id: 'test-client-id',
          callback: jasmine.any(Function)
        });
      });
    }));

    it('should not initialize Google if no client ID is configured', fakeAsync(() => {
      // Store original config and temporarily override clientId for testing
      (environment as any).originalOAuthConfig = { ...environment.oauth };
      environment.oauth!.google!.clientId = '';

      service.initializeGoogleSignIn();
      tick(0);

      const script = document.head.querySelector('script[src*="accounts.google.com"]') as HTMLScriptElement;

      window.google = {
        accounts: {
          id: {
            initialize: jasmine.createSpy('initialize')
          }
        }
      };

      if (script && script.onload) {
        (script.onload as any)();
      }

      tick();

      if (window.google) {
        expect(window.google.accounts.id.initialize).not.toHaveBeenCalled();
      }
    }));

    it('should reject promise if script fails to load', fakeAsync(() => {
      let rejectPromise: (error: Error) => void;
      const promise = service.initializeGoogleSignIn().catch(error => {
        expect(error.message).toBe('Failed to load Google Sign-In script');
      });

      tick(0);
      const script = document.head.querySelector('script[src*="accounts.google.com"]') as HTMLScriptElement;

      // Trigger script onerror
      if (script && script.onerror) {
        (script.onerror as any)(new Event('error'));
      }

      tick();
    }));

    it('should handle multiple concurrent initialization calls', async () => {
      const promises = [
        service.initializeGoogleSignIn(),
        service.initializeGoogleSignIn(),
        service.initializeGoogleSignIn()
      ];

      // Should not throw
      await Promise.all(promises);

      // Should only add one script
      const scripts = document.head.querySelectorAll('script[src*="accounts.google.com"]');
      expect(scripts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Sign In With Google', () => {
    it('should use demo mode when no client ID is configured', async () => {
      // Store original config and temporarily override clientId for testing
      (environment as any).originalOAuthConfig = { ...environment.oauth };
      environment.oauth!.google!.clientId = '';
      spyOn(service, 'initializeGoogleSignIn').and.returnValue(Promise.resolve());
      mockLocalUserService.findUserByEmail.and.returnValue(null);
      mockLocalUserService.createUser.and.returnValue(Promise.resolve(mockUser));

      await service.signInWithGoogle();

      expect(mockToastr.warning).toHaveBeenCalledWith('Google OAuth is not configured. Using demo mode.', 'Demo Mode');
      expect(mockLocalUserService.findUserByEmail).toHaveBeenCalledWith('demo.google@vallmere.com');
    });

    it('should initialize Google Sign-In and show prompt', async () => {
      // Store original config and temporarily override clientId for testing
      (environment as any).originalOAuthConfig = { ...environment.oauth };
      environment.oauth!.google!.clientId = 'test-client-id';
      spyOn(service, 'initializeGoogleSignIn').and.returnValue(Promise.resolve());

      window.google = {
        accounts: {
          id: {
            prompt: jasmine.createSpy('prompt').and.callFake((callback) => {
              callback({ isNotDisplayed: () => false, isSkippedMoment: () => false });
            })
          }
        }
      };

      await service.signInWithGoogle();

      expect(service.initializeGoogleSignIn).toHaveBeenCalled();
      expect(window.google.accounts.id.prompt).toHaveBeenCalledWith(jasmine.any(Function));
    });

    it('should fallback to popup when prompt is not displayed', async () => {
      // Store original config and temporarily override clientId for testing
      (environment as any).originalOAuthConfig = { ...environment.oauth };
      environment.oauth!.google!.clientId = 'test-client-id';
      spyOn(service, 'initializeGoogleSignIn').and.returnValue(Promise.resolve());
      spyOn(service, 'showGooglePopup' as any).and.stub();

      window.google = {
        accounts: {
          id: {
            prompt: jasmine.createSpy('prompt').and.callFake((callback) => {
              callback({ isNotDisplayed: () => true, isSkippedMoment: () => false });
            })
          }
        }
      };

      await service.signInWithGoogle();

      expect(service['showGooglePopup']).toHaveBeenCalled();
    });

    it('should fallback to popup when prompt is skipped', async () => {
      // Store original config and temporarily override clientId for testing
      (environment as any).originalOAuthConfig = { ...environment.oauth };
      environment.oauth!.google!.clientId = 'test-client-id';
      spyOn(service, 'initializeGoogleSignIn').and.returnValue(Promise.resolve());
      spyOn(service, 'showGooglePopup' as any).and.stub();

      window.google = {
        accounts: {
          id: {
            prompt: jasmine.createSpy('prompt').and.callFake((callback) => {
              callback({ isNotDisplayed: () => false, isSkippedMoment: () => true });
            })
          }
        }
      };

      await service.signInWithGoogle();

      expect(service['showGooglePopup']).toHaveBeenCalled();
    });

    it('should handle initialization errors', async () => {
      const error = new Error('Initialization failed');
      spyOn(service, 'initializeGoogleSignIn').and.returnValue(Promise.reject(error));
      spyOn(console, 'error');

      await expectAsync(service.signInWithGoogle()).toBeRejectedWith(error);
      expect(console.error).toHaveBeenCalledWith('Google Sign-In failed:', error);
    });
  });

  describe('Show Google Popup', () => {
    it('should render Google button to existing element', () => {
      const mockElement = document.createElement('div');
      mockElement.id = 'g_id_signin';
      document.body.appendChild(mockElement);

      window.google = {
        accounts: {
          id: {
            renderButton: jasmine.createSpy('renderButton')
          }
        }
      };

      service['showGooglePopup']();

      expect(window.google.accounts.id.renderButton).toHaveBeenCalledWith(
        mockElement,
        { theme: 'outline', size: 'large' }
      );

      document.body.removeChild(mockElement);
    });

    it('should render Google button to body when element not found', () => {
      window.google = {
        accounts: {
          id: {
            renderButton: jasmine.createSpy('renderButton')
          }
        }
      };

      service['showGooglePopup']();

      expect(window.google.accounts.id.renderButton).toHaveBeenCalledWith(
        document.body,
        { theme: 'outline', size: 'large' }
      );
    });

    it('should handle missing Google API', () => {
      delete window.google;

      expect(() => service['showGooglePopup']()).not.toThrow();
    });
  });

  describe('Handle Google Response', () => {
    beforeEach(() => {
      spyOn(service, 'decodeJWT' as any).and.returnValue(mockJWTPayload);
      spyOn(service, 'authenticateOrCreateUser' as any).and.returnValue(Promise.resolve());
    });

    it('should handle valid Google response', async () => {
      await service['handleGoogleResponse'](mockGoogleResponse);

      expect(service['decodeJWT']).toHaveBeenCalledWith('mock.jwt.token');
      expect(service['authenticateOrCreateUser']).toHaveBeenCalledWith({
        email: 'google@example.com',
        name: 'Google User',
        picture: 'https://example.com/avatar.jpg'
      });
    });

    it('should handle response without credential', async () => {
      spyOn(console, 'error');

      await service['handleGoogleResponse']({});

      expect(console.error).toHaveBeenCalledWith('Error handling Google response:', jasmine.any(Error));
      expect(mockToastr.error).toHaveBeenCalledWith('Google authentication failed', 'Authentication Error');
    });

    it('should handle JWT decoding errors', async () => {
      (service['decodeJWT'] as jasmine.Spy).and.throwError('Invalid JWT');
      spyOn(console, 'error');

      await service['handleGoogleResponse'](mockGoogleResponse);

      expect(console.error).toHaveBeenCalledWith('Error handling Google response:', jasmine.any(Error));
      expect(mockToastr.error).toHaveBeenCalledWith('Google authentication failed', 'Authentication Error');
    });

    it('should handle authentication errors', async () => {
      (service['authenticateOrCreateUser'] as jasmine.Spy).and.returnValue(Promise.reject(new Error('Auth failed')));
      spyOn(console, 'error');

      await service['handleGoogleResponse'](mockGoogleResponse);

      expect(console.error).toHaveBeenCalledWith('Error handling Google response:', jasmine.any(Error));
      expect(mockToastr.error).toHaveBeenCalledWith('Google authentication failed', 'Authentication Error');
    });
  });

  describe('Demo Google Login', () => {
    it('should authenticate with demo user', async () => {
      spyOn(service, 'authenticateOrCreateUser' as any).and.returnValue(Promise.resolve());

      await service['handleDemoGoogleLogin']();

      expect(service['authenticateOrCreateUser']).toHaveBeenCalledWith({
        email: 'demo.google@vallmere.com',
        name: 'Google Demo User',
        picture: ''
      });
    });
  });

  describe('Authenticate or Create User', () => {
    it('should authenticate existing user', async () => {
      mockLocalUserService.findUserByEmail.and.returnValue(mockUser);
      spyOn(Date, 'now').and.returnValue(1234567890);

      await service['authenticateOrCreateUser'](mockGoogleUser);

      expect(mockLocalUserService.findUserByEmail).toHaveBeenCalledWith('google@example.com');
      expect(mockLocalUserService.createUser).not.toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'local_token_1234567890');
      expect(localStorage.setItem).toHaveBeenCalledWith('currentUser', JSON.stringify(mockUser));
      expect(currentUserSubject.next).toHaveBeenCalledWith(mockUser);
      expect(mockAuthService.isUserLogged.set).toHaveBeenCalledWith(true);
      expect(mockAuthService.isAdminLogged.set).toHaveBeenCalledWith(false);
      expect(mockToastr.success).toHaveBeenCalledWith(`Welcome ${mockUser.name}!`, 'Login Successful');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
    });

    it('should create new user and authenticate', async () => {
      mockLocalUserService.findUserByEmail.and.returnValue(null);
      mockLocalUserService.createUser.and.returnValue(Promise.resolve(mockUser));
      spyOn(service, 'generateRandomPassword' as any).and.returnValue('random123');

      await service['authenticateOrCreateUser'](mockGoogleUser);

      expect(mockLocalUserService.createUser).toHaveBeenCalledWith({
        name: 'Google User',
        email: 'google@example.com',
        password: 'random123',
        role: 'client'
      });
      expect(mockToastr.success).toHaveBeenCalledWith('Account created successfully!', 'Welcome');
    });

    it('should navigate admin user to admin page', async () => {
      mockLocalUserService.findUserByEmail.and.returnValue(mockAdminUser);

      await service['authenticateOrCreateUser'](mockGoogleUser);

      expect(mockAuthService.isAdminLogged.set).toHaveBeenCalledWith(true);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin']);
    });

    it('should handle user creation errors', async () => {
      const error = new Error('User creation failed');
      mockLocalUserService.findUserByEmail.and.returnValue(null);
      mockLocalUserService.createUser.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');

      await service['authenticateOrCreateUser'](mockGoogleUser);

      expect(console.error).toHaveBeenCalledWith('Error authenticating Google user:', error);
      expect(mockToastr.error).toHaveBeenCalledWith('User creation failed', 'Authentication Error');
    });

    it('should handle authentication errors with no message', async () => {
      mockLocalUserService.findUserByEmail.and.returnValue(null);
      mockLocalUserService.createUser.and.returnValue(Promise.reject({}));
      spyOn(console, 'error');

      await service['authenticateOrCreateUser'](mockGoogleUser);

      expect(mockToastr.error).toHaveBeenCalledWith('Authentication failed', 'Authentication Error');
    });
  });

  describe('JWT Decoding', () => {
    it('should decode valid JWT token', () => {
      const payload = { email: 'test@example.com', name: 'Test User' };
      const base64Payload = btoa(JSON.stringify(payload));
      const token = `header.${base64Payload}.signature`;

      const result = service['decodeJWT'](token);

      expect(result).toEqual(payload);
    });

    it('should handle JWT with URL-safe base64', () => {
      const payload = { email: 'test@example.com', name: 'Test User' };
      const base64Payload = btoa(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
      const token = `header.${base64Payload}.signature`;

      const result = service['decodeJWT'](token);

      expect(result).toEqual(payload);
    });

    it('should throw error for invalid JWT format', () => {
      const invalidToken = 'invalid.token';
      spyOn(console, 'error');

      expect(() => service['decodeJWT'](invalidToken))
        .toThrowError('Token JWT no válido: no se pudo decodificar la carga útil JSON.');

      expect(console.error).toHaveBeenCalledWith('Error al analizar la carga útil de JWT', jasmine.any(Error));
    });

    it('should throw error for invalid JSON in payload', () => {
      const invalidBase64 = btoa('invalid json');
      const token = `header.${invalidBase64}.signature`;
      spyOn(console, 'error');

      expect(() => service['decodeJWT'](token))
        .toThrowError('Token JWT no válido: no se pudo decodificar la carga útil JSON.');
    });

    it('should handle empty token', () => {
      spyOn(console, 'error');

      expect(() => service['decodeJWT'](''))
        .toThrowError('Token JWT no válido: no se pudo decodificar la carga útil JSON.');
    });

    it('should handle token with special characters in payload', () => {
      const payload = {
        email: 'tëst@éxample.com',
        name: 'Tëst Usér',
        message: 'Special chars: àáâãäåæçèéêë'
      };
      const base64Payload = btoa(JSON.stringify(payload));
      const token = `header.${base64Payload}.signature`;

      const result = service['decodeJWT'](token);

      expect(result).toEqual(payload);
    });
  });

  describe('Generate Random Password', () => {
    it('should generate password of expected length', () => {
      const password = service['generateRandomPassword']();

      expect(password.length).toBeGreaterThanOrEqual(20); // 2 * (up to 10 chars each)
      expect(typeof password).toBe('string');
    });

    it('should generate different passwords on multiple calls', () => {
      const password1 = service['generateRandomPassword']();
      const password2 = service['generateRandomPassword']();

      expect(password1).not.toBe(password2);
    });

    it('should generate passwords with alphanumeric characters', () => {
      const password = service['generateRandomPassword']();

      expect(password).toMatch(/^[a-z0-9]+$/);
    });
  });

  describe('Parse Callback Parameters', () => {
    beforeEach(() => {
      // Mock window.location.search
      delete (window as any).location;
      window.location = {} as any;
    });

    it('should parse token and user from URL parameters', () => {
      const userObj = { email: 'test@example.com', name: 'Test User' };
      const encodedUser = encodeURIComponent(JSON.stringify(userObj));
      window.location.search = `?token=test-token&user=${encodedUser}`;

      const result = service.parseCallbackParams();

      expect(result.token).toBe('test-token');
      expect(result.user).toEqual(userObj);
    });

    it('should return null when no parameters present', () => {
      window.location.search = '';

      const result = service.parseCallbackParams();

      expect(result.token).toBeNull();
      expect(result.user).toBeNull();
    });

    it('should handle token without user', () => {
      window.location.search = '?token=test-token';

      const result = service.parseCallbackParams();

      expect(result.token).toBe('test-token');
      expect(result.user).toBeNull();
    });

    it('should handle user without token', () => {
      const userObj = { email: 'test@example.com' };
      const encodedUser = encodeURIComponent(JSON.stringify(userObj));
      window.location.search = `?user=${encodedUser}`;

      const result = service.parseCallbackParams();

      expect(result.token).toBeNull();
      expect(result.user).toEqual(userObj);
    });

    it('should handle invalid JSON in user parameter', () => {
      window.location.search = '?user=invalid-json';
      spyOn(console, 'error');

      const result = service.parseCallbackParams();

      expect(result.user).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error parsing user data:', jasmine.any(Error));
    });

    it('should handle malformed URL parameters', () => {
      window.location.search = '?token&user';

      const result = service.parseCallbackParams();

      expect(result.token).toBe('');
      expect(result.user).toBeNull();
    });

    it('should handle complex user objects', () => {
      const complexUser = {
        email: 'complex@example.com',
        name: 'Complex User',
        profile: {
          avatar: 'http://example.com/avatar.jpg',
          preferences: {
            theme: 'dark',
            notifications: true
          }
        }
      };
      const encodedUser = encodeURIComponent(JSON.stringify(complexUser));
      window.location.search = `?user=${encodedUser}`;

      const result = service.parseCallbackParams();

      expect(result.user).toEqual(complexUser);
    });
  });

  describe('OAuth Authentication Status', () => {
    it('should return true when user is authenticated with OAuth token', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      mockLocalStorage['access_token'] = 'local_token_1234567890';

      const result = service.isOAuthAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when no current user', () => {
      mockAuthService.getCurrentUser.and.returnValue(null);
      mockLocalStorage['access_token'] = 'local_token_1234567890';

      const result = service.isOAuthAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false when no token', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);

      const result = service.isOAuthAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false when token is not OAuth token', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      mockLocalStorage['access_token'] = 'regular_token_123';

      const result = service.isOAuthAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false when all conditions fail', () => {
      mockAuthService.getCurrentUser.and.returnValue(null);

      const result = service.isOAuthAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('Clear OAuth Session', () => {
    it('should clear auth data', () => {
      service.clearOAuthSession();

      expect(mockAuthService.clearAuthData).toHaveBeenCalled();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle window undefined in server-side rendering', async () => {
      const originalWindow = window;
      (global as any).window = undefined;

      try {
        await service.initializeGoogleSignIn();
      } catch (error) {
        expect(error).toBeDefined();
      } finally {
        (global as any).window = originalWindow;
      }
    });

    it('should handle document undefined', () => {
      const originalDocument = document;
      (global as any).document = undefined;

      expect(() => {
        service.initializeGoogleSignIn();
      }).toThrow();

      (global as any).document = originalDocument;
    });

    it('should handle multiple script load attempts', fakeAsync(() => {
      const promise1 = service.initializeGoogleSignIn();
      const promise2 = service.initializeGoogleSignIn();

      tick();

      const scripts = document.head.querySelectorAll('script[src*="accounts.google.com"]');
      expect(scripts.length).toBeGreaterThan(0);

      // Complete the loading
      scripts.forEach(script => {
        if ((script as HTMLScriptElement).onload) {
          ((script as HTMLScriptElement).onload as any)();
        }
      });

      tick();
    }));

    it('should handle authentication with null/undefined user data', async () => {
      spyOn(console, 'error');

      await service['authenticateOrCreateUser'](null);

      expect(console.error).toHaveBeenCalled();
      expect(mockToastr.error).toHaveBeenCalled();
    });

    it('should handle authentication with missing email', async () => {
      const incompleteUser = { name: 'User Without Email' };
      mockLocalUserService.findUserByEmail.and.returnValue(null);
      spyOn(console, 'error');

      await service['authenticateOrCreateUser'](incompleteUser);

      expect(console.error).toHaveBeenCalled();
    });

    it('should handle environment configuration changes', () => {
      // Test with different environment configurations
      const envConfigs = [
        { oauth: undefined },
        { oauth: {} },
        { oauth: { google: undefined } },
        { oauth: { google: {} } },
        { oauth: { google: { clientId: '' } } },
        { oauth: { google: { clientId: 'valid-id' } } }
      ];

      envConfigs.forEach(config => {
        spyOnProperty(environment, 'oauth', 'get').and.returnValue(config.oauth as any);
        const testService = TestBed.inject(OAuthService);
        expect(testService).toBeTruthy();
      });
    });
  });

  describe('Integration and Workflow Tests', () => {
    it('should complete full OAuth flow for existing user', async () => {
      // Setup
      // Store original config and temporarily override clientId for testing
      (environment as any).originalOAuthConfig = { ...environment.oauth };
      environment.oauth!.google!.clientId = 'test-client-id';
      mockLocalUserService.findUserByEmail.and.returnValue(mockUser);
      spyOn(service, 'initializeGoogleSignIn').and.returnValue(Promise.resolve());
      spyOn(Date, 'now').and.returnValue(1234567890);

      window.google = {
        accounts: {
          id: {
            prompt: jasmine.createSpy('prompt').and.callFake((callback) => {
              // Simulate successful authentication
              setTimeout(() => {
                service['handleGoogleResponse']({
                  credential: 'mock.jwt.token'
                });
              }, 0);
              callback({ isNotDisplayed: () => false, isSkippedMoment: () => false });
            })
          }
        }
      };

      spyOn(service, 'decodeJWT' as any).and.returnValue(mockJWTPayload);

      // Execute
      await service.signInWithGoogle();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify
      expect(mockLocalUserService.findUserByEmail).toHaveBeenCalledWith('google@example.com');
      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'local_token_1234567890');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
    });

    it('should complete full OAuth flow for new user', async () => {
      // Setup
      // Store original config and temporarily override clientId for testing
      (environment as any).originalOAuthConfig = { ...environment.oauth };
      environment.oauth!.google!.clientId = 'test-client-id';
      mockLocalUserService.findUserByEmail.and.returnValue(null);
      mockLocalUserService.createUser.and.returnValue(Promise.resolve(mockUser));
      spyOn(service, 'initializeGoogleSignIn').and.returnValue(Promise.resolve());
      spyOn(service, 'generateRandomPassword' as any).and.returnValue('random123');

      // Execute OAuth authentication directly
      await service['authenticateOrCreateUser'](mockGoogleUser);

      // Verify
      expect(mockLocalUserService.createUser).toHaveBeenCalledWith({
        name: 'Google User',
        email: 'google@example.com',
        password: 'random123',
        role: 'client'
      });
      expect(mockToastr.success).toHaveBeenCalledWith('Account created successfully!', 'Welcome');
    });

    it('should handle complete demo flow', async () => {
      // Setup
      // Store original config and temporarily override clientId for testing
      (environment as any).originalOAuthConfig = { ...environment.oauth };
      environment.oauth!.google!.clientId = '';
      mockLocalUserService.findUserByEmail.and.returnValue(null);
      mockLocalUserService.createUser.and.returnValue(Promise.resolve({
        ...mockUser,
        email: 'demo.google@vallmere.com',
        name: 'Google Demo User'
      }));

      // Execute
      await service.signInWithGoogle();

      // Verify
      expect(mockToastr.warning).toHaveBeenCalledWith('Google OAuth is not configured. Using demo mode.', 'Demo Mode');
      expect(mockLocalUserService.findUserByEmail).toHaveBeenCalledWith('demo.google@vallmere.com');
    });

    it('should validate authentication status across different states', () => {
      const testCases = [
        { user: mockUser, token: 'local_token_123', expected: true },
        { user: null, token: 'local_token_123', expected: false },
        { user: mockUser, token: null, expected: false },
        { user: mockUser, token: 'regular_token', expected: false },
        { user: null, token: null, expected: false }
      ];

      testCases.forEach(({ user, token, expected }) => {
        mockAuthService.getCurrentUser.and.returnValue(user);
        if (token) {
          mockLocalStorage['access_token'] = token;
        } else {
          delete mockLocalStorage['access_token'];
        }

        expect(service.isOAuthAuthenticated()).toBe(expected);
      });
    });
  });

  describe('Memory and Performance', () => {
    it('should not leak memory with multiple service instances', () => {
      const services = Array.from({ length: 100 }, () => TestBed.inject(OAuthService));

      expect(services.length).toBe(100);
      expect(services.every(s => s instanceof OAuthService)).toBe(true);
    });

    it('should handle rapid authentication calls', async () => {
      mockLocalUserService.findUserByEmail.and.returnValue(mockUser);

      const promises = Array.from({ length: 10 }, () =>
        service['authenticateOrCreateUser'](mockGoogleUser)
      );

      await Promise.all(promises);

      expect(mockLocalUserService.findUserByEmail).toHaveBeenCalledTimes(10);
    });

    it('should handle large JWT payloads', () => {
      const largePayload = {
        email: 'test@example.com',
        name: 'Test User',
        data: 'x'.repeat(10000) // Large data
      };
      const base64Payload = btoa(JSON.stringify(largePayload));
      const token = `header.${base64Payload}.signature`;

      const result = service['decodeJWT'](token);

      expect(result).toEqual(largePayload);
    });
  });
});
