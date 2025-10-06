import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';

import { LocalUserService } from './local-user.service';
import { CryptoService } from './crypto.service';
import { User, RegisterRequest } from '../interfaces/user.interface';
import { Address, CreateAddressRequest } from '../interfaces/address.interface';

describe('LocalUserService', () => {
  let service: LocalUserService;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCryptoService: jasmine.SpyObj<CryptoService>;
  let mockLocalStorage: { [key: string]: string };

  const mockUser: User = {
    userId: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: 'client',
    carts: [],
    orders: []
  };

  const mockRegisterRequest: RegisterRequest = {
    name: 'New User',
    email: 'new@example.com',
    password: 'password123',
    role: 'client'
  };

  const mockAddress: Address = {
    addressId: 1,
    userId: 1,
    title: 'Home',
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    type: 'both',
    isDefault: true
  };

  const mockCreateAddressRequest: CreateAddressRequest = {
    title: 'Work',
    street: '456 Office Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210',
    country: 'USA',
    type: 'shipping',
    isDefault: false
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

    const toastrSpy = jasmine.createSpyObj('ToastrService', [
      'success', 'error', 'warning', 'info'
    ]);

    const cryptoServiceSpy = jasmine.createSpyObj('CryptoService', [
      'hashPassword', 'comparePasswords'
    ]);

    TestBed.configureTestingModule({
      providers: [
        LocalUserService,
        { provide: ToastrService, useValue: toastrSpy },
        { provide: CryptoService, useValue: cryptoServiceSpy }
      ]
    });

    mockToastr = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    mockCryptoService = TestBed.inject(CryptoService) as jasmine.SpyObj<CryptoService>;
    mockCryptoService.hashPassword.and.returnValue(Promise.resolve('hashedPassword'));
    mockCryptoService.comparePasswords.and.returnValue(Promise.resolve(true));

    service = TestBed.inject(LocalUserService);
  });

  afterEach(() => {
    // Clear localStorage mock
    mockLocalStorage = {};
  });

  describe('Service Creation and Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize demo users when no users exist', fakeAsync(() => {
      // Clear localStorage to ensure fresh start
      mockLocalStorage = {};
      mockCryptoService.hashPassword.calls.reset();
      spyOn(console, 'log');

      const newService = new LocalUserService(mockToastr, mockCryptoService);
      tick();

      // Should hash both passwords
      expect(mockCryptoService.hashPassword).toHaveBeenCalledWith('admin123');
      expect(mockCryptoService.hashPassword).toHaveBeenCalledWith('cliente123');
      expect(console.log).toHaveBeenCalledWith('Demo users created successfully');
    }));

    it('should not initialize demo users when users already exist', fakeAsync(() => {
      mockLocalStorage['vallmere_users'] = JSON.stringify([mockUser]);
      spyOn(console, 'log');

      const newService = TestBed.inject(LocalUserService);
      tick();

      expect(console.log).not.toHaveBeenCalledWith('Demo users created successfully');
    }));

    it('should handle errors during demo user initialization', fakeAsync(() => {
      // Clear localStorage to ensure fresh start
      mockLocalStorage = {};
      mockCryptoService.hashPassword.and.returnValue(Promise.reject(new Error('Hash error')));
      spyOn(console, 'error');

      const newService = new LocalUserService(mockToastr, mockCryptoService);
      tick();

      expect(console.error).toHaveBeenCalledWith('Error creating demo users:', jasmine.any(Error));
    }));

    it('should only initialize once', fakeAsync(() => {
      spyOn(service, 'createUser' as any);

      // Call init multiple times
      service['init']();
      service['init']();
      service['init']();

      tick();

      // Should not call createUser multiple times for demo users
      expect(service['initialized']).toBe(true);
    }));
  });

  describe('User Management - Create User', () => {
    beforeEach(() => {
      // Clear localStorage and reset ID counters for clean user creation tests
      mockLocalStorage = {};
      // Reset the service to get clean ID counters
      service = TestBed.inject(LocalUserService);
    });

    it('should create user successfully', async () => {
      const result = await service.createUser(mockRegisterRequest);

      expect(mockCryptoService.hashPassword).toHaveBeenCalledWith('password123');
      expect(result.name).toBe('New User');
      expect(result.email).toBe('new@example.com');
      expect(result.role).toBe('client');
      expect(result.userId).toBe(1);
      expect(result.password).toBeUndefined(); // Password should not be returned
    });

    it('should trim and lowercase email', async () => {
      const request = { ...mockRegisterRequest, email: ' NEW@EXAMPLE.COM ' };
      const result = await service.createUser(request);

      expect(result.email).toBe('new@example.com');
    });

    it('should trim name', async () => {
      const request = { ...mockRegisterRequest, name: '  New User  ' };
      const result = await service.createUser(request);

      expect(result.name).toBe('New User');
    });

    it('should default role to client when not provided', async () => {
      const request = { ...mockRegisterRequest, role: undefined };
      const result = await service.createUser(request);

      expect(result.role).toBe('client');
    });

    it('should throw error for duplicate email', async () => {
      mockLocalStorage['vallmere_users'] = JSON.stringify([mockUser]);

      await expectAsync(service.createUser({
        ...mockRegisterRequest,
        email: 'TEST@EXAMPLE.COM' // Different case
      })).toBeRejectedWithError('Email already exists');
    });

    it('should validate user data before creation', async () => {
      const invalidRequest = {
        name: '',
        email: 'invalid-email',
        password: '123',
        role: 'client'
      } as RegisterRequest;

      await expectAsync(service.createUser(invalidRequest))
        .toBeRejectedWithError('Name must be at least 3 characters');
    });

    it('should generate sequential user IDs', async () => {
      const user1 = await service.createUser(mockRegisterRequest);
      const user2 = await service.createUser({
        ...mockRegisterRequest,
        email: 'user2@example.com'
      });

      expect(user1.userId).toBe(1);
      expect(user2.userId).toBe(2);
    });

    it('should handle existing user ID counter', async () => {
      mockLocalStorage['vallmere_user_id_counter'] = '5';
      const result = await service.createUser(mockRegisterRequest);

      expect(result.userId).toBe(6);
    });

    it('should initialize carts and orders arrays', async () => {
      const result = await service.createUser(mockRegisterRequest);

      expect(result.carts).toEqual([]);
      expect(result.orders).toEqual([]);
    });
  });

  describe('User Management - Validation', () => {
    it('should validate name length', async () => {
      const request = { ...mockRegisterRequest, name: 'ab' };

      await expectAsync(service.createUser(request))
        .toBeRejectedWithError('Name must be at least 3 characters');
    });

    it('should validate empty name', async () => {
      const request = { ...mockRegisterRequest, name: '   ' };

      await expectAsync(service.createUser(request))
        .toBeRejectedWithError('Name must be at least 3 characters');
    });

    it('should validate email format', async () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user.example.com',
        '',
        '   '
      ];

      for (const email of invalidEmails) {
        const request = { ...mockRegisterRequest, email };
        await expectAsync(service.createUser(request))
          .toBeRejectedWithError('Please enter a valid email address');
      }
    });

    it('should validate password length', async () => {
      const request = { ...mockRegisterRequest, password: '123' };

      await expectAsync(service.createUser(request))
        .toBeRejectedWithError('Password must be at least 6 characters');
    });

    it('should validate role values', async () => {
      const request = { ...mockRegisterRequest, role: 'invalid' as any };

      await expectAsync(service.createUser(request))
        .toBeRejectedWithError('Role must be admin or client');
    });

    it('should accept valid admin role', async () => {
      const request: RegisterRequest = { ...mockRegisterRequest, role: 'admin' };
      const result = await service.createUser(request);

      expect(result.role).toBe('admin');
    });
  });

  describe('User Management - Retrieval', () => {
    beforeEach(() => {
      const users = [mockUser, { ...mockUser, userId: 2, email: 'user2@example.com' }];
      mockLocalStorage['vallmere_users'] = JSON.stringify(users);
    });

    it('should get all users', () => {
      const users = service.getAllUsers();

      expect(users.length).toBe(2);
      expect(users[0].userId).toBe(1);
      expect(users[1].userId).toBe(2);
    });

    it('should return empty array when no users exist', () => {
      mockLocalStorage['vallmere_users'] = '';
      const users = service.getAllUsers();

      expect(users).toEqual([]);
    });

    it('should find user by ID', () => {
      const user = service.findUserById(1);

      expect(user?.userId).toBe(1);
      expect(user?.email).toBe('test@example.com');
      expect(user?.password).toBeUndefined(); // Password should be stripped
    });

    it('should return null for non-existent user ID', () => {
      const user = service.findUserById(999);

      expect(user).toBeNull();
    });

    it('should find user by email (case insensitive)', () => {
      const user = service.findUserByEmail('TEST@EXAMPLE.COM');

      expect(user?.userId).toBe(1);
      expect(user?.email).toBe('test@example.com');
      expect(user?.password).toBeUndefined(); // Password should be stripped
    });

    it('should return null for non-existent email', () => {
      const user = service.findUserByEmail('nonexistent@example.com');

      expect(user).toBeNull();
    });

    it('should handle corrupted user data gracefully', () => {
      mockLocalStorage['vallmere_users'] = 'invalid json';

      expect(() => service.getAllUsers()).toThrow();
    });
  });

  describe('User Management - Update', () => {
    beforeEach(() => {
      mockLocalStorage['vallmere_users'] = JSON.stringify([mockUser]);
    });

    it('should update user successfully', async () => {
      const updateData = { name: 'Updated Name', email: 'updated@example.com' };
      const result = await service.updateUser(1, updateData);

      expect(result.name).toBe('Updated Name');
      expect(result.email).toBe('updated@example.com');
      expect(result.password).toBeUndefined(); // Password should be stripped
    });

    it('should hash password when updating password', async () => {
      const updateData = { password: 'newPassword123' };
      await service.updateUser(1, updateData);

      expect(mockCryptoService.hashPassword).toHaveBeenCalledWith('newPassword123');
    });

    it('should throw error for non-existent user', async () => {
      await expectAsync(service.updateUser(999, { name: 'Updated' }))
        .toBeRejectedWithError('User with ID 999 not found');
    });

    it('should persist changes to localStorage', async () => {
      await service.updateUser(1, { name: 'Persisted Name' });

      const users = JSON.parse(mockLocalStorage['vallmere_users']);
      expect(users[0].name).toBe('Persisted Name');
    });

    it('should not update non-existent properties', async () => {
      const originalUser = JSON.parse(mockLocalStorage['vallmere_users'])[0];
      await service.updateUser(1, { name: 'Updated' });

      const updatedUsers = JSON.parse(mockLocalStorage['vallmere_users']);
      expect(updatedUsers[0].email).toBe(originalUser.email); // Unchanged
    });
  });

  describe('User Management - Remove', () => {
    beforeEach(() => {
      const users = [
        mockUser,
        { ...mockUser, userId: 2, email: 'user2@example.com' }
      ];
      mockLocalStorage['vallmere_users'] = JSON.stringify(users);
    });

    it('should remove user successfully', () => {
      service.removeUser(1);

      const users = JSON.parse(mockLocalStorage['vallmere_users']);
      expect(users.length).toBe(1);
      expect(users[0].userId).toBe(2);
    });

    it('should throw error for non-existent user', () => {
      expect(() => service.removeUser(999))
        .toThrowError('User with ID 999 not found');
    });

    it('should not modify array when user not found', () => {
      const originalUsers = JSON.parse(mockLocalStorage['vallmere_users']);

      try {
        service.removeUser(999);
      } catch (error) {
        const currentUsers = JSON.parse(mockLocalStorage['vallmere_users']);
        expect(currentUsers).toEqual(originalUsers);
      }
    });
  });

  describe('Authentication', () => {
    beforeEach(() => {
      mockLocalStorage['vallmere_users'] = JSON.stringify([mockUser]);
    });

    it('should authenticate user with valid credentials', async () => {
      mockCryptoService.comparePasswords.and.returnValue(Promise.resolve(true));

      const result = await service.authenticateUser('test@example.com', 'password123');

      expect(result?.userId).toBe(1);
      expect(result?.password).toBeUndefined(); // Password should be stripped
      expect(mockCryptoService.comparePasswords).toHaveBeenCalledWith('password123', 'hashedPassword123');
    });

    it('should authenticate with case-insensitive email', async () => {
      mockCryptoService.comparePasswords.and.returnValue(Promise.resolve(true));

      const result = await service.authenticateUser('TEST@EXAMPLE.COM', 'password123');

      expect(result?.userId).toBe(1);
    });

    it('should return null for non-existent email', async () => {
      const result = await service.authenticateUser('nonexistent@example.com', 'password123');

      expect(result).toBeNull();
      expect(mockCryptoService.comparePasswords).not.toHaveBeenCalled();
    });

    it('should return null for invalid password', async () => {
      mockCryptoService.comparePasswords.and.returnValue(Promise.resolve(false));

      const result = await service.authenticateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should validate password correctly', async () => {
      mockCryptoService.comparePasswords.and.returnValue(Promise.resolve(true));

      const result = await service.validatePassword('plainPassword', 'hashedPassword');

      expect(result).toBe(true);
      expect(mockCryptoService.comparePasswords).toHaveBeenCalledWith('plainPassword', 'hashedPassword');
    });
  });

  describe('Address Management - Creation', () => {
    it('should create address successfully', () => {
      const result = service.createAddress(1, mockCreateAddressRequest);

      expect(result.userId).toBe(1);
      expect(result.title).toBe('Work');
      expect(result.street).toBe('456 Office Blvd');
      expect(result.addressId).toBe(1);
      expect(result.type).toBe('shipping');
      expect(result.isDefault).toBe(false); // Respects explicit isDefault: false setting
    });

    it('should trim address fields', () => {
      const request = {
        ...mockCreateAddressRequest,
        title: '  Home  ',
        street: '  123 Main St  ',
        city: '  New York  '
      };

      const result = service.createAddress(1, request);

      expect(result.title).toBe('Home');
      expect(result.street).toBe('123 Main St');
      expect(result.city).toBe('New York');
    });

    it('should default type to "both"', () => {
      const request = { ...mockCreateAddressRequest, type: undefined };
      const result = service.createAddress(1, request);

      expect(result.type).toBe('both');
    });

    it('should make first address default automatically when isDefault not specified', () => {
      // Ensure clean state - no existing addresses for this user
      const addresses = JSON.parse(mockLocalStorage['vallmere_addresses'] || '[]');
      const cleanAddresses = addresses.filter((addr: any) => addr.userId !== 1);
      mockLocalStorage['vallmere_addresses'] = JSON.stringify(cleanAddresses);

      const result = service.createAddress(1, {
        ...mockCreateAddressRequest
        // isDefault not specified, should default to true for first address
      });

      expect(result.isDefault).toBe(true);
    });

    it('should respect explicit isDefault false for first address', () => {
      const result = service.createAddress(1, {
        ...mockCreateAddressRequest,
        isDefault: false
      });

      expect(result.isDefault).toBe(false);
    });

    it('should not make second address default automatically', () => {
      // Create first address
      service.createAddress(1, mockCreateAddressRequest);

      // Create second address
      const result = service.createAddress(1, {
        ...mockCreateAddressRequest,
        title: 'Second Address',
        isDefault: false
      });

      expect(result.isDefault).toBe(false);
    });

    it('should unset other defaults when creating new default address', () => {
      // Create first address (will be default)
      service.createAddress(1, mockCreateAddressRequest);

      // Create second address as default
      service.createAddress(1, {
        ...mockCreateAddressRequest,
        title: 'New Default',
        isDefault: true
      });

      const addresses = service.getUserAddresses(1);
      const defaultAddresses = addresses.filter(addr => addr.isDefault);

      expect(defaultAddresses.length).toBe(1);
      expect(defaultAddresses[0].title).toBe('New Default');
    });

    it('should generate sequential address IDs', () => {
      const addr1 = service.createAddress(1, mockCreateAddressRequest);
      const addr2 = service.createAddress(1, {
        ...mockCreateAddressRequest,
        title: 'Second'
      });

      expect(addr1.addressId).toBe(1);
      expect(addr2.addressId).toBe(2);
    });

    it('should handle existing address ID counter', () => {
      mockLocalStorage['vallmere_address_id_counter'] = '5';
      const result = service.createAddress(1, mockCreateAddressRequest);

      expect(result.addressId).toBe(6);
    });
  });

  describe('Address Management - Validation', () => {
    it('should validate title length', () => {
      const request = { ...mockCreateAddressRequest, title: 'a' };

      expect(() => service.createAddress(1, request))
        .toThrowError('Title must be at least 2 characters');
    });

    it('should validate street length', () => {
      const request = { ...mockCreateAddressRequest, street: '123' };

      expect(() => service.createAddress(1, request))
        .toThrowError('Street must be at least 5 characters');
    });

    it('should validate city length', () => {
      const request = { ...mockCreateAddressRequest, city: 'a' };

      expect(() => service.createAddress(1, request))
        .toThrowError('City must be at least 2 characters');
    });

    it('should validate state length', () => {
      const request = { ...mockCreateAddressRequest, state: 'a' };

      expect(() => service.createAddress(1, request))
        .toThrowError('State must be at least 2 characters');
    });

    it('should validate zipCode length', () => {
      const request = { ...mockCreateAddressRequest, zipCode: '12' };

      expect(() => service.createAddress(1, request))
        .toThrowError('Zip code must be at least 3 characters');
    });

    it('should validate country length', () => {
      const request = { ...mockCreateAddressRequest, country: 'a' };

      expect(() => service.createAddress(1, request))
        .toThrowError('Country must be at least 2 characters');
    });

    it('should validate address type', () => {
      const request = { ...mockCreateAddressRequest, type: 'invalid' as any };

      expect(() => service.createAddress(1, request))
        .toThrowError('Type must be shipping, billing, or both');
    });

    it('should accept valid address types', () => {
      const types: ('shipping' | 'billing' | 'both')[] = ['shipping', 'billing', 'both'];

      types.forEach(type => {
        const request = { ...mockCreateAddressRequest, type, title: `${type} address` };
        const result = service.createAddress(1, request);
        expect(result.type).toBe(type);
      });
    });
  });

  describe('Address Management - Retrieval', () => {
    beforeEach(() => {
      const addresses = [
        { ...mockAddress, userId: 1, addressId: 1 },
        { ...mockAddress, userId: 1, addressId: 2, title: 'Work' },
        { ...mockAddress, userId: 2, addressId: 3, title: 'Other User' }
      ];
      mockLocalStorage['vallmere_addresses'] = JSON.stringify(addresses);
    });

    it('should get user addresses', () => {
      const addresses = service.getUserAddresses(1);

      expect(addresses.length).toBe(2);
      expect(addresses.every(addr => addr.userId === 1)).toBe(true);
    });

    it('should return empty array for user with no addresses', () => {
      const addresses = service.getUserAddresses(999);

      expect(addresses).toEqual([]);
    });

    it('should get specific address by ID and user ID', () => {
      const address = service.getAddress(1, 1);

      expect(address?.addressId).toBe(1);
      expect(address?.userId).toBe(1);
    });

    it('should return null for non-existent address', () => {
      const address = service.getAddress(999, 1);

      expect(address).toBeNull();
    });

    it('should return null for address belonging to different user', () => {
      const address = service.getAddress(3, 1); // Address 3 belongs to user 2

      expect(address).toBeNull();
    });

    it('should handle empty addresses storage', () => {
      mockLocalStorage['vallmere_addresses'] = '';
      const addresses = service.getUserAddresses(1);

      expect(addresses).toEqual([]);
    });
  });

  describe('Address Management - Update', () => {
    beforeEach(() => {
      const addresses = [
        { ...mockAddress, userId: 1, addressId: 1 },
        { ...mockAddress, userId: 1, addressId: 2, title: 'Work', isDefault: false }
      ];
      mockLocalStorage['vallmere_addresses'] = JSON.stringify(addresses);
    });

    it('should update address successfully', () => {
      const updateData = { title: 'Updated Home', street: '789 New St' };
      const result = service.updateAddress(1, 1, updateData);

      expect(result.title).toBe('Updated Home');
      expect(result.street).toBe('789 New St');
      expect(result.city).toBe('New York'); // Unchanged
    });

    it('should unset other defaults when setting new default', () => {
      service.updateAddress(2, 1, { isDefault: true });

      const addresses = service.getUserAddresses(1);
      const defaultAddresses = addresses.filter(addr => addr.isDefault);

      expect(defaultAddresses.length).toBe(1);
      expect(defaultAddresses[0].addressId).toBe(2);
    });

    it('should throw error for non-existent address', () => {
      expect(() => service.updateAddress(999, 1, { title: 'Updated' }))
        .toThrowError('Address with ID 999 not found');
    });

    it('should throw error when updating address of different user', () => {
      expect(() => service.updateAddress(1, 2, { title: 'Updated' }))
        .toThrowError('Address with ID 1 not found');
    });
  });

  describe('Address Management - Set Default', () => {
    beforeEach(() => {
      const addresses = [
        { ...mockAddress, userId: 1, addressId: 1, isDefault: true },
        { ...mockAddress, userId: 1, addressId: 2, title: 'Work', isDefault: false },
        { ...mockAddress, userId: 2, addressId: 3, title: 'Other User', isDefault: true }
      ];
      mockLocalStorage['vallmere_addresses'] = JSON.stringify(addresses);
    });

    it('should set address as default', () => {
      const result = service.setDefaultAddress(2, 1);

      expect(result.isDefault).toBe(true);
      expect(result.addressId).toBe(2);

      // Check that other addresses for same user are not default
      const addresses = service.getUserAddresses(1);
      const otherAddress = addresses.find(addr => addr.addressId === 1);
      expect(otherAddress?.isDefault).toBe(false);
    });

    it('should not affect other users default addresses', () => {
      service.setDefaultAddress(2, 1);

      const otherUserAddresses = JSON.parse(mockLocalStorage['vallmere_addresses']);
      const otherUserDefaultAddress = otherUserAddresses.find(
        (addr: Address) => addr.userId === 2 && addr.addressId === 3
      );
      expect(otherUserDefaultAddress.isDefault).toBe(true);
    });

    it('should throw error for non-existent address', () => {
      expect(() => service.setDefaultAddress(999, 1))
        .toThrowError('Address with ID 999 not found');
    });

    it('should throw error when setting default for address of different user', () => {
      expect(() => service.setDefaultAddress(3, 1))
        .toThrowError('Address with ID 3 not found');
    });
  });

  describe('Address Management - Remove', () => {
    beforeEach(() => {
      const addresses = [
        { ...mockAddress, userId: 1, addressId: 1 },
        { ...mockAddress, userId: 1, addressId: 2, title: 'Work' },
        { ...mockAddress, userId: 2, addressId: 3, title: 'Other User' }
      ];
      mockLocalStorage['vallmere_addresses'] = JSON.stringify(addresses);
    });

    it('should remove address successfully', () => {
      service.removeAddress(1, 1);

      const addresses = service.getUserAddresses(1);
      expect(addresses.length).toBe(1);
      expect(addresses[0].addressId).toBe(2);
    });

    it('should not remove addresses of other users', () => {
      service.removeAddress(1, 1);

      const allAddresses = JSON.parse(mockLocalStorage['vallmere_addresses']);
      const otherUserAddress = allAddresses.find((addr: Address) => addr.userId === 2);
      expect(otherUserAddress).toBeTruthy();
    });

    it('should throw error for non-existent address', () => {
      expect(() => service.removeAddress(999, 1))
        .toThrowError('Address with ID 999 not found');
    });

    it('should throw error when removing address of different user', () => {
      expect(() => service.removeAddress(3, 1))
        .toThrowError('Address with ID 3 not found');
    });
  });

  describe('Helper Methods and Edge Cases', () => {
    it('should handle localStorage errors gracefully', () => {
      (localStorage.getItem as jasmine.Spy).and.throwError('Storage error');

      expect(() => service.getAllUsers()).toThrow();
    });

    it('should handle JSON parsing errors', () => {
      mockLocalStorage['vallmere_users'] = 'invalid json';

      expect(() => service.getAllUsers()).toThrow();
    });

    it('should validate email format correctly', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user-name@example-domain.com'
      ];

      const invalidEmails = [
        'plainaddress',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        'user@domain',
        ''
      ];

      validEmails.forEach(email => {
        expect(service['isValidEmail'](email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(service['isValidEmail'](email)).toBe(false);
      });
    });

    it('should handle counter initialization', () => {
      // Test user ID counter
      const userId1 = service['getNextUserId']();
      const userId2 = service['getNextUserId']();
      expect(userId2).toBe(userId1 + 1);

      // Test address ID counter
      const addrId1 = service['getNextAddressId']();
      const addrId2 = service['getNextAddressId']();
      expect(addrId2).toBe(addrId1 + 1);
    });

    it('should handle existing counters', () => {
      mockLocalStorage['vallmere_user_id_counter'] = '10';
      mockLocalStorage['vallmere_address_id_counter'] = '20';

      const userId = service['getNextUserId']();
      const addressId = service['getNextAddressId']();

      expect(userId).toBe(11);
      expect(addressId).toBe(21);
    });

    it('should handle invalid counter values', () => {
      mockLocalStorage['vallmere_user_id_counter'] = 'invalid';
      mockLocalStorage['vallmere_address_id_counter'] = 'invalid';

      // Should default to 0 and return 1
      const userId = service['getNextUserId']();
      const addressId = service['getNextAddressId']();

      expect(userId).toBe(1);
      expect(addressId).toBe(1);
    });
  });

  describe('Data Integrity and Consistency', () => {
    it('should maintain data consistency after multiple operations', async () => {
      // Create users
      const user1 = await service.createUser(mockRegisterRequest);
      const user2 = await service.createUser({
        ...mockRegisterRequest,
        email: 'user2@example.com'
      });

      // Create addresses
      const addr1 = service.createAddress(user1.userId!, mockCreateAddressRequest);
      const addr2 = service.createAddress(user2.userId!, mockCreateAddressRequest);

      // Verify data integrity
      const allUsers = service.getAllUsers();
      const user1Addresses = service.getUserAddresses(user1.userId!);
      const user2Addresses = service.getUserAddresses(user2.userId!);

      expect(allUsers.length).toBe(2);
      expect(user1Addresses.length).toBe(1);
      expect(user2Addresses.length).toBe(1);
      expect(user1Addresses[0].userId).toBe(user1.userId!);
      expect(user2Addresses[0].userId).toBe(user2.userId!);
    });

    it('should handle user removal and address cleanup scenario', () => {
      // Create user and addresses
      const users = [mockUser];
      const addresses = [
        { ...mockAddress, userId: 1, addressId: 1 },
        { ...mockAddress, userId: 1, addressId: 2, title: 'Work' }
      ];

      mockLocalStorage['vallmere_users'] = JSON.stringify(users);
      mockLocalStorage['vallmere_addresses'] = JSON.stringify(addresses);

      // Remove user
      service.removeUser(1);

      // Addresses still exist (service doesn't cascade delete)
      const remainingAddresses = service.getUserAddresses(1);
      expect(remainingAddresses.length).toBe(2);

      const allUsers = service.getAllUsers();
      expect(allUsers.length).toBe(0);
    });

    it('should handle concurrent user creation with same email', async () => {
      // This simulates race condition where two users try to register with same email
      const request1 = mockRegisterRequest;
      const request2 = { ...mockRegisterRequest };

      await service.createUser(request1);

      await expectAsync(service.createUser(request2))
        .toBeRejectedWithError('Email already exists');
    });

    it('should maintain default address invariant', () => {
      // Ensure clean state - no existing addresses for this user
      const addresses = JSON.parse(mockLocalStorage['vallmere_addresses'] || '[]');
      const cleanAddresses = addresses.filter((addr: any) => addr.userId !== 1);
      mockLocalStorage['vallmere_addresses'] = JSON.stringify(cleanAddresses);

      // Create multiple addresses and ensure only one is default
      service.createAddress(1, mockCreateAddressRequest); // Will be default
      service.createAddress(1, { ...mockCreateAddressRequest, title: 'Work', isDefault: false });
      service.createAddress(1, { ...mockCreateAddressRequest, title: 'Vacation', isDefault: false });

      let userAddresses = service.getUserAddresses(1);
      let defaultCount = userAddresses.filter(addr => addr.isDefault).length;
      expect(defaultCount).toBe(1);

      // Set new default
      service.setDefaultAddress(2, 1);

      userAddresses = service.getUserAddresses(1);
      defaultCount = userAddresses.filter(addr => addr.isDefault).length;
      expect(defaultCount).toBe(1);
      expect(userAddresses.find(addr => addr.addressId === 2)?.isDefault).toBe(true);
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle large user datasets', async () => {
      const users = Array.from({ length: 1000 }, (_, i) => ({
        ...mockUser,
        userId: i + 1,
        email: `user${i}@example.com`
      }));

      mockLocalStorage['vallmere_users'] = JSON.stringify(users);

      const startTime = performance.now();
      const foundUser = service.findUserByEmail('user500@example.com');
      const endTime = performance.now();

      expect(foundUser?.userId).toBe(501);
      expect(endTime - startTime).toBeLessThan(100); // Should be reasonably fast
    });

    it('should handle large address datasets', () => {
      const addresses = Array.from({ length: 1000 }, (_, i) => ({
        ...mockAddress,
        addressId: i + 1,
        userId: Math.floor(i / 10) + 1, // 10 addresses per user
        title: `Address ${i}`
      }));

      mockLocalStorage['vallmere_addresses'] = JSON.stringify(addresses);

      const startTime = performance.now();
      const userAddresses = service.getUserAddresses(50);
      const endTime = performance.now();

      expect(userAddresses.length).toBe(10);
      expect(endTime - startTime).toBeLessThan(50); // Should be fast
    });

    it('should not leak memory with multiple service instances', () => {
      const services = Array.from({ length: 100 }, () => TestBed.inject(LocalUserService));

      expect(services.length).toBe(100);
      expect(services.every(s => s instanceof LocalUserService)).toBe(true);
    });

    it('should handle rapid operations without corruption', async () => {
      const promises = Array.from({ length: 50 }, (_, i) =>
        service.createUser({
          ...mockRegisterRequest,
          email: `user${i}@example.com`
        })
      );

      const results = await Promise.all(promises);

      expect(results.length).toBe(50);
      expect(new Set(results.map(r => r.userId)).size).toBe(50); // All unique IDs
      expect(new Set(results.map(r => r.email)).size).toBe(50); // All unique emails
    });
  });
});
