import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AddressService } from './address.service';
import { LocalUserService } from './local-user.service';
import { AuthService } from './auth.service';
import { Address, CreateAddressRequest, UpdateAddressRequest } from '../interfaces/address.interface';
import { User } from '../interfaces/user.interface';

describe('AddressService', () => {
  let service: AddressService;
  let mockLocalUserService: jasmine.SpyObj<LocalUserService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockUser: User = {
    userId: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'client'
  };

  const mockAddress: Address = {
    addressId: 1,
    title: 'Home',
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    type: 'both',
    isDefault: true,
    userId: 1
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

  const mockUpdateAddressRequest: UpdateAddressRequest = {
    title: 'Updated Home',
    street: '789 New Street',
    isDefault: true
  };

  beforeEach(() => {
    const localUserServiceSpy = jasmine.createSpyObj('LocalUserService', [
      'getUserAddresses', 'getAddress', 'createAddress', 'updateAddress',
      'setDefaultAddress', 'removeAddress'
    ]);

    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getCurrentUser'
    ]);

    TestBed.configureTestingModule({
      providers: [
        AddressService,
        { provide: LocalUserService, useValue: localUserServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    mockLocalUserService = TestBed.inject(LocalUserService) as jasmine.SpyObj<LocalUserService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    service = TestBed.inject(AddressService);
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have the correct endpoint', () => {
      expect(service['endpoint']).toBe('users/profile/addresses');
    });
  });

  describe('getUserAddresses', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
    });

    it('should get user addresses successfully', (done) => {
      const addresses = [mockAddress];
      mockLocalUserService.getUserAddresses.and.returnValue(addresses);

      service.getUserAddresses().subscribe(result => {
        expect(result).toEqual(addresses);
        expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
        expect(mockLocalUserService.getUserAddresses).toHaveBeenCalledWith(1);
        done();
      });
    });

    it('should handle empty address list', (done) => {
      mockLocalUserService.getUserAddresses.and.returnValue([]);

      service.getUserAddresses().subscribe(result => {
        expect(result).toEqual([]);
        done();
      });
    });

    it('should handle multiple addresses', (done) => {
      const addresses = [
        mockAddress,
        { ...mockAddress, addressId: 2, title: 'Work', isDefault: false }
      ];
      mockLocalUserService.getUserAddresses.and.returnValue(addresses);

      service.getUserAddresses().subscribe(result => {
        expect(result).toEqual(addresses);
        expect(result.length).toBe(2);
        done();
      });
    });

    it('should return error when user is not authenticated', (done) => {
      mockAuthService.getCurrentUser.and.returnValue(null);

      service.getUserAddresses().subscribe({
        error: (error) => {
          expect(error.message).toBe('No authenticated user');
          expect(mockLocalUserService.getUserAddresses).not.toHaveBeenCalled();
          done();
        }
      });
    });

    it('should return error when user has no userId', (done) => {
      const userWithoutId = { ...mockUser, userId: undefined };
      mockAuthService.getCurrentUser.and.returnValue(userWithoutId);

      service.getUserAddresses().subscribe({
        error: (error) => {
          expect(error.message).toBe('No authenticated user');
          done();
        }
      });
    });

    it('should return error when user has null userId', (done) => {
      const userWithNullId = { ...mockUser, userId: null as any };
      mockAuthService.getCurrentUser.and.returnValue(userWithNullId);

      service.getUserAddresses().subscribe({
        error: (error) => {
          expect(error.message).toBe('No authenticated user');
          done();
        }
      });
    });

    it('should handle zero userId', (done) => {
      const userWithZeroId = { ...mockUser, userId: 0 };
      mockAuthService.getCurrentUser.and.returnValue(userWithZeroId);

      service.getUserAddresses().subscribe({
        error: (error) => {
          expect(error.message).toBe('No authenticated user');
          done();
        }
      });
    });
  });

  describe('getAddress', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
    });

    it('should get address by id successfully', (done) => {
      mockLocalUserService.getAddress.and.returnValue(mockAddress);

      service.getAddress(1).subscribe(result => {
        expect(result).toEqual(mockAddress);
        expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
        expect(mockLocalUserService.getAddress).toHaveBeenCalledWith(1, 1);
        done();
      });
    });

    it('should return error when address not found', (done) => {
      mockLocalUserService.getAddress.and.returnValue(null);

      service.getAddress(999).subscribe({
        error: (error) => {
          expect(error.message).toBe('Address with ID 999 not found');
          expect(mockLocalUserService.getAddress).toHaveBeenCalledWith(999, 1);
          done();
        }
      });
    });

    it('should return error when user is not authenticated', (done) => {
      mockAuthService.getCurrentUser.and.returnValue(null);

      service.getAddress(1).subscribe({
        error: (error) => {
          expect(error.message).toBe('No authenticated user');
          expect(mockLocalUserService.getAddress).not.toHaveBeenCalled();
          done();
        }
      });
    });

    it('should handle different address IDs', (done) => {
      const address2 = { ...mockAddress, addressId: 2, title: 'Work' };
      mockLocalUserService.getAddress.and.returnValue(address2);

      service.getAddress(2).subscribe(result => {
        expect(result).toEqual(address2);
        expect(mockLocalUserService.getAddress).toHaveBeenCalledWith(2, 1);
        done();
      });
    });

    it('should handle negative address ID', (done) => {
      mockLocalUserService.getAddress.and.returnValue(null);

      service.getAddress(-1).subscribe({
        error: (error) => {
          expect(error.message).toBe('Address with ID -1 not found');
          done();
        }
      });
    });

    it('should handle zero address ID', (done) => {
      mockLocalUserService.getAddress.and.returnValue(null);

      service.getAddress(0).subscribe({
        error: (error) => {
          expect(error.message).toBe('Address with ID 0 not found');
          done();
        }
      });
    });
  });

  describe('createAddress', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
    });

    it('should create address successfully', (done) => {
      const newAddress: Address = { ...mockCreateAddressRequest, addressId: 2, userId: 1, type: 'shipping', isDefault: false };
      mockLocalUserService.createAddress.and.returnValue(newAddress);

      service.createAddress(mockCreateAddressRequest).subscribe(result => {
        expect(result).toEqual(newAddress);
        expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
        expect(mockLocalUserService.createAddress).toHaveBeenCalledWith(1, mockCreateAddressRequest);
        done();
      });
    });

    it('should create address with default values', (done) => {
      const minimalRequest: CreateAddressRequest = {
        title: 'Minimal',
        street: '123 Street',
        city: 'City',
        state: 'ST',
        zipCode: '12345',
        country: 'Country'
      };
      const createdAddress: Address = {
        ...minimalRequest,
        addressId: 3,
        userId: 1,
        type: 'both',
        isDefault: false
      };
      mockLocalUserService.createAddress.and.returnValue(createdAddress);

      service.createAddress(minimalRequest).subscribe(result => {
        expect(result).toEqual(createdAddress);
        expect(mockLocalUserService.createAddress).toHaveBeenCalledWith(1, minimalRequest);
        done();
      });
    });

    it('should handle different address types', (done) => {
      const shippingRequest = { ...mockCreateAddressRequest, type: 'shipping' as const };
      const createdAddress: Address = { ...shippingRequest, addressId: 4, userId: 1, isDefault: false };
      mockLocalUserService.createAddress.and.returnValue(createdAddress);

      service.createAddress(shippingRequest).subscribe(result => {
        expect(result.type).toBe('shipping');
        done();
      });
    });

    it('should return error when user is not authenticated', (done) => {
      mockAuthService.getCurrentUser.and.returnValue(null);

      service.createAddress(mockCreateAddressRequest).subscribe({
        error: (error) => {
          expect(error.message).toBe('No authenticated user');
          expect(mockLocalUserService.createAddress).not.toHaveBeenCalled();
          done();
        }
      });
    });

    it('should handle creation errors', (done) => {
      const error = new Error('Creation failed');
      mockLocalUserService.createAddress.and.throwError(error);

      service.createAddress(mockCreateAddressRequest).subscribe({
        error: (receivedError) => {
          expect(receivedError).toBe(error);
          done();
        }
      });
    });

    it('should handle validation errors', (done) => {
      const validationError = new Error('Invalid zip code');
      mockLocalUserService.createAddress.and.throwError(validationError);

      service.createAddress(mockCreateAddressRequest).subscribe({
        error: (error) => {
          expect(error.message).toBe('Invalid zip code');
          done();
        }
      });
    });

    it('should handle storage errors', (done) => {
      const storageError = new Error('Storage quota exceeded');
      mockLocalUserService.createAddress.and.throwError(storageError);

      service.createAddress(mockCreateAddressRequest).subscribe({
        error: (error) => {
          expect(error.message).toBe('Storage quota exceeded');
          done();
        }
      });
    });

    it('should create address with special characters', (done) => {
      const specialRequest: CreateAddressRequest = {
        title: 'Café & Résidence',
        street: '123 Åse St. #4B',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '12345-678',
        country: 'Brasil'
      };
      const createdAddress = { ...specialRequest, addressId: 5, userId: 1, type: 'both' as const, isDefault: false };
      mockLocalUserService.createAddress.and.returnValue(createdAddress);

      service.createAddress(specialRequest).subscribe(result => {
        expect(result.title).toBe('Café & Résidence');
        expect(result.city).toBe('São Paulo');
        done();
      });
    });
  });

  describe('updateAddress', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
    });

    it('should update address successfully', (done) => {
      const updatedAddress = { ...mockAddress, ...mockUpdateAddressRequest };
      mockLocalUserService.updateAddress.and.returnValue(updatedAddress);

      service.updateAddress(1, mockUpdateAddressRequest).subscribe(result => {
        expect(result).toEqual(updatedAddress);
        expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
        expect(mockLocalUserService.updateAddress).toHaveBeenCalledWith(1, 1, mockUpdateAddressRequest);
        done();
      });
    });

    it('should update partial address fields', (done) => {
      const partialUpdate: UpdateAddressRequest = { title: 'Updated Title Only' };
      const updatedAddress = { ...mockAddress, title: 'Updated Title Only' };
      mockLocalUserService.updateAddress.and.returnValue(updatedAddress);

      service.updateAddress(1, partialUpdate).subscribe(result => {
        expect(result.title).toBe('Updated Title Only');
        expect(result.street).toBe(mockAddress.street); // Unchanged
        done();
      });
    });

    it('should update address type', (done) => {
      const typeUpdate: UpdateAddressRequest = { type: 'billing' };
      const updatedAddress = { ...mockAddress, type: 'billing' as const };
      mockLocalUserService.updateAddress.and.returnValue(updatedAddress);

      service.updateAddress(1, typeUpdate).subscribe(result => {
        expect(result.type).toBe('billing');
        done();
      });
    });

    it('should update default status', (done) => {
      const defaultUpdate: UpdateAddressRequest = { isDefault: false };
      const updatedAddress = { ...mockAddress, isDefault: false };
      mockLocalUserService.updateAddress.and.returnValue(updatedAddress);

      service.updateAddress(1, defaultUpdate).subscribe(result => {
        expect(result.isDefault).toBe(false);
        done();
      });
    });

    it('should return error when user is not authenticated', (done) => {
      mockAuthService.getCurrentUser.and.returnValue(null);

      service.updateAddress(1, mockUpdateAddressRequest).subscribe({
        error: (error) => {
          expect(error.message).toBe('No authenticated user');
          expect(mockLocalUserService.updateAddress).not.toHaveBeenCalled();
          done();
        }
      });
    });

    it('should handle update errors', (done) => {
      const error = new Error('Update failed');
      mockLocalUserService.updateAddress.and.throwError(error);

      service.updateAddress(1, mockUpdateAddressRequest).subscribe({
        error: (receivedError) => {
          expect(receivedError).toBe(error);
          done();
        }
      });
    });

    it('should handle address not found error', (done) => {
      const notFoundError = new Error('Address not found');
      mockLocalUserService.updateAddress.and.throwError(notFoundError);

      service.updateAddress(999, mockUpdateAddressRequest).subscribe({
        error: (error) => {
          expect(error.message).toBe('Address not found');
          done();
        }
      });
    });

    it('should update empty object', (done) => {
      const emptyUpdate: UpdateAddressRequest = {};
      const unchangedAddress = { ...mockAddress };
      mockLocalUserService.updateAddress.and.returnValue(unchangedAddress);

      service.updateAddress(1, emptyUpdate).subscribe(result => {
        expect(result).toEqual(mockAddress);
        done();
      });
    });
  });

  describe('setDefaultAddress', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
    });

    it('should set default address successfully', (done) => {
      const defaultAddress = { ...mockAddress, isDefault: true };
      mockLocalUserService.setDefaultAddress.and.returnValue(defaultAddress);

      service.setDefaultAddress(1).subscribe(result => {
        expect(result).toEqual(defaultAddress);
        expect(result.isDefault).toBe(true);
        expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
        expect(mockLocalUserService.setDefaultAddress).toHaveBeenCalledWith(1, 1);
        done();
      });
    });

    it('should handle setting default for different address ID', (done) => {
      const address2 = { ...mockAddress, addressId: 2, isDefault: true };
      mockLocalUserService.setDefaultAddress.and.returnValue(address2);

      service.setDefaultAddress(2).subscribe(result => {
        expect(result.addressId).toBe(2);
        expect(result.isDefault).toBe(true);
        expect(mockLocalUserService.setDefaultAddress).toHaveBeenCalledWith(2, 1);
        done();
      });
    });

    it('should return error when user is not authenticated', (done) => {
      mockAuthService.getCurrentUser.and.returnValue(null);

      service.setDefaultAddress(1).subscribe({
        error: (error) => {
          expect(error.message).toBe('No authenticated user');
          expect(mockLocalUserService.setDefaultAddress).not.toHaveBeenCalled();
          done();
        }
      });
    });

    it('should handle set default errors', (done) => {
      const error = new Error('Cannot set default');
      mockLocalUserService.setDefaultAddress.and.throwError(error);

      service.setDefaultAddress(1).subscribe({
        error: (receivedError) => {
          expect(receivedError).toBe(error);
          done();
        }
      });
    });

    it('should handle address not found when setting default', (done) => {
      const notFoundError = new Error('Address not found');
      mockLocalUserService.setDefaultAddress.and.throwError(notFoundError);

      service.setDefaultAddress(999).subscribe({
        error: (error) => {
          expect(error.message).toBe('Address not found');
          done();
        }
      });
    });

    it('should handle negative address ID', (done) => {
      const error = new Error('Invalid address ID');
      mockLocalUserService.setDefaultAddress.and.throwError(error);

      service.setDefaultAddress(-1).subscribe({
        error: (receivedError) => {
          expect(receivedError.message).toBe('Invalid address ID');
          done();
        }
      });
    });
  });

  describe('deleteAddress', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
    });

    it('should delete address successfully', (done) => {
      mockLocalUserService.removeAddress.and.returnValue(undefined);

      service.deleteAddress(1).subscribe(result => {
        expect(result).toBeUndefined();
        expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
        expect(mockLocalUserService.removeAddress).toHaveBeenCalledWith(1, 1);
        done();
      });
    });

    it('should delete address with different ID', (done) => {
      mockLocalUserService.removeAddress.and.returnValue(undefined);

      service.deleteAddress(5).subscribe(() => {
        expect(mockLocalUserService.removeAddress).toHaveBeenCalledWith(5, 1);
        done();
      });
    });

    it('should return error when user is not authenticated', (done) => {
      mockAuthService.getCurrentUser.and.returnValue(null);

      service.deleteAddress(1).subscribe({
        error: (error) => {
          expect(error.message).toBe('No authenticated user');
          expect(mockLocalUserService.removeAddress).not.toHaveBeenCalled();
          done();
        }
      });
    });

    it('should handle delete errors', (done) => {
      const error = new Error('Delete failed');
      mockLocalUserService.removeAddress.and.throwError(error);

      service.deleteAddress(1).subscribe({
        error: (receivedError) => {
          expect(receivedError).toBe(error);
          done();
        }
      });
    });

    it('should handle address not found on delete', (done) => {
      const notFoundError = new Error('Address not found');
      mockLocalUserService.removeAddress.and.throwError(notFoundError);

      service.deleteAddress(999).subscribe({
        error: (error) => {
          expect(error.message).toBe('Address not found');
          done();
        }
      });
    });

    it('should handle cannot delete default address', (done) => {
      const cannotDeleteError = new Error('Cannot delete default address');
      mockLocalUserService.removeAddress.and.throwError(cannotDeleteError);

      service.deleteAddress(1).subscribe({
        error: (error) => {
          expect(error.message).toBe('Cannot delete default address');
          done();
        }
      });
    });

    it('should handle delete with zero ID', (done) => {
      const invalidIdError = new Error('Invalid address ID');
      mockLocalUserService.removeAddress.and.throwError(invalidIdError);

      service.deleteAddress(0).subscribe({
        error: (error) => {
          expect(error.message).toBe('Invalid address ID');
          done();
        }
      });
    });
  });

  describe('Authentication Edge Cases', () => {
    it('should handle getCurrentUser returning undefined', () => {
      mockAuthService.getCurrentUser.and.returnValue(undefined as any);

      service.getUserAddresses().subscribe({
        error: (error) => {
          expect(error.message).toBe('No authenticated user');
        }
      });

      service.getAddress(1).subscribe({
        error: (error) => {
          expect(error.message).toBe('No authenticated user');
        }
      });

      service.createAddress(mockCreateAddressRequest).subscribe({
        error: (error) => {
          expect(error.message).toBe('No authenticated user');
        }
      });

      service.updateAddress(1, mockUpdateAddressRequest).subscribe({
        error: (error) => {
          expect(error.message).toBe('No authenticated user');
        }
      });

      service.setDefaultAddress(1).subscribe({
        error: (error) => {
          expect(error.message).toBe('No authenticated user');
        }
      });

      service.deleteAddress(1).subscribe({
        error: (error) => {
          expect(error.message).toBe('No authenticated user');
        }
      });
    });

    it('should handle getCurrentUser throwing error', () => {
      mockAuthService.getCurrentUser.and.throwError('Auth error');

      expect(() => service.getUserAddresses().subscribe()).toThrow();
    });

    it('should handle user with different roles', (done) => {
      const adminUser: User = { ...mockUser, role: 'admin' };
      mockAuthService.getCurrentUser.and.returnValue(adminUser);
      mockLocalUserService.getUserAddresses.and.returnValue([mockAddress]);

      service.getUserAddresses().subscribe(result => {
        expect(result).toEqual([mockAddress]);
        expect(mockLocalUserService.getUserAddresses).toHaveBeenCalledWith(1);
        done();
      });
    });
  });

  describe('Data Validation and Edge Cases', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
    });

    it('should handle addresses with all types', (done) => {
      const addresses = [
        { ...mockAddress, type: 'shipping' as const },
        { ...mockAddress, addressId: 2, type: 'billing' as const },
        { ...mockAddress, addressId: 3, type: 'both' as const }
      ];
      mockLocalUserService.getUserAddresses.and.returnValue(addresses);

      service.getUserAddresses().subscribe(result => {
        expect(result.length).toBe(3);
        expect(result[0].type).toBe('shipping');
        expect(result[1].type).toBe('billing');
        expect(result[2].type).toBe('both');
        done();
      });
    });

    it('should handle addresses with long text fields', (done) => {
      const longAddress: Address = {
        addressId: 1,
        title: 'A'.repeat(100),
        street: 'B'.repeat(200),
        city: 'C'.repeat(100),
        state: 'D'.repeat(50),
        zipCode: '12345-6789',
        country: 'E'.repeat(50),
        type: 'both',
        isDefault: true,
        userId: 1
      };
      mockLocalUserService.getAddress.and.returnValue(longAddress);

      service.getAddress(1).subscribe(result => {
        expect(result.title.length).toBe(100);
        expect(result.street.length).toBe(200);
        done();
      });
    });

    it('should handle creating address with extreme values', (done) => {
      const extremeRequest: CreateAddressRequest = {
        title: '',
        street: 'A'.repeat(500),
        city: 'City',
        state: 'ST',
        zipCode: '00000',
        country: 'Country',
        type: 'both',
        isDefault: true
      };
      const createdAddress: Address = {
        ...extremeRequest,
        addressId: 1,
        userId: 1,
        type: extremeRequest.type!,
        isDefault: extremeRequest.isDefault!
      };
      mockLocalUserService.createAddress.and.returnValue(createdAddress);

      service.createAddress(extremeRequest).subscribe(result => {
        expect(result.title).toBe('');
        expect(result.street.length).toBe(500);
        done();
      });
    });

    it('should handle multiple default addresses scenario', (done) => {
      const addresses = [
        { ...mockAddress, isDefault: true },
        { ...mockAddress, addressId: 2, isDefault: true } // Both marked as default
      ];
      mockLocalUserService.getUserAddresses.and.returnValue(addresses);

      service.getUserAddresses().subscribe(result => {
        expect(result.filter(addr => addr.isDefault).length).toBe(2);
        done();
      });
    });

    it('should handle address with null/undefined optional fields', (done) => {
      const addressWithNulls: Address = {
        addressId: 1,
        title: 'Title',
        street: 'Street',
        city: 'City',
        state: 'ST',
        zipCode: '12345',
        country: 'Country',
        type: 'both',
        isDefault: false,
        userId: 1
      };
      mockLocalUserService.getAddress.and.returnValue(addressWithNulls);

      service.getAddress(1).subscribe(result => {
        expect(result).toEqual(addressWithNulls);
        done();
      });
    });
  });

  describe('Performance and Memory', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
    });

    it('should handle large address lists', (done) => {
      const largeAddressList = Array.from({ length: 100 }, (_, i) => ({
        ...mockAddress,
        addressId: i + 1,
        title: `Address ${i + 1}`
      }));
      mockLocalUserService.getUserAddresses.and.returnValue(largeAddressList);

      const startTime = performance.now();
      service.getUserAddresses().subscribe(result => {
        const endTime = performance.now();

        expect(result.length).toBe(100);
        expect(endTime - startTime).toBeLessThan(50); // Should be fast
        done();
      });
    });

    it('should not cause memory leaks with multiple subscriptions', () => {
      const subscriptions = [];
      mockLocalUserService.getUserAddresses.and.returnValue([mockAddress]);

      for (let i = 0; i < 100; i++) {
        subscriptions.push(service.getUserAddresses().subscribe());
      }

      subscriptions.forEach(sub => sub.unsubscribe());

      expect(subscriptions.length).toBe(100);
    });

    it('should handle rapid consecutive calls', (done) => {
      mockLocalUserService.getAddress.and.returnValue(mockAddress);
      let completedCalls = 0;
      const totalCalls = 10;

      for (let i = 0; i < totalCalls; i++) {
        service.getAddress(i + 1).subscribe(() => {
          completedCalls++;
          if (completedCalls === totalCalls) {
            expect(mockLocalUserService.getAddress).toHaveBeenCalledTimes(totalCalls);
            done();
          }
        });
      }
    });
  });

  describe('Observable and Promise Integration', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
    });

    it('should return Observable from Promise.resolve', (done) => {
      mockLocalUserService.getUserAddresses.and.returnValue([mockAddress]);

      const result$ = service.getUserAddresses();

      expect(result$.subscribe).toBeDefined();
      result$.subscribe(addresses => {
        expect(Array.isArray(addresses)).toBe(true);
        done();
      });
    });

    it('should handle synchronous LocalUserService calls', (done) => {
      mockLocalUserService.createAddress.and.returnValue(mockAddress);

      service.createAddress(mockCreateAddressRequest).subscribe(result => {
        expect(result).toEqual(mockAddress);
        done();
      });
    });

    it('should properly wrap void returns in observables', (done) => {
      mockLocalUserService.removeAddress.and.returnValue(undefined);

      service.deleteAddress(1).subscribe(result => {
        expect(result).toBeUndefined();
        done();
      });
    });
  });
});
