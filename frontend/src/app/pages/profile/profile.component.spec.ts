import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { ProfileComponent } from './profile.component';
import { AuthService } from '../../shared/services/auth.service';
import { AddressService } from '../../shared/services/address.service';
import { User } from '../../shared/interfaces/user.interface';
import { Address } from '../../shared/interfaces/address.interface';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockAddressService: jasmine.SpyObj<AddressService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockUser: User = {
    userId: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'client'
  };

  const mockAddresses: Address[] = [
    {
      addressId: 1,
      userId: 1,
      title: 'Home',
      street: '123 Main St',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      country: 'Test Country',
      type: 'both',
      isDefault: true
    },
    {
      addressId: 2,
      userId: 1,
      title: 'Work',
      street: '456 Work Ave',
      city: 'Work City',
      state: 'Work State',
      zipCode: '67890',
      country: 'Work Country',
      type: 'shipping',
      isDefault: false
    }
  ];

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getProfile', 'updateProfile', 'logout'
    ]);
    const addressServiceSpy = jasmine.createSpyObj('AddressService', [
      'getUserAddresses', 'createAddress', 'updateAddress', 'deleteAddress', 'setDefaultAddress'
    ]);
    const toastrSpy = jasmine.createSpyObj('ToastrService', [
      'success', 'error', 'warning', 'info'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: AddressService, useValue: addressServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;

    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockAddressService = TestBed.inject(AddressService) as jasmine.SpyObj<AddressService>;
    mockToastr = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      mockAuthService.getProfile.and.returnValue(of(mockUser));
      mockAddressService.getUserAddresses.and.returnValue(of(mockAddresses));

      fixture.detectChanges();

      expect(component).toBeTruthy();
    });

    it('should initialize forms with correct validators', () => {
      expect(component.profileForm).toBeDefined();
      expect(component.addressForm).toBeDefined();

      // Test profile form validators
      const nameControl = component.profileForm.get('name');
      const emailControl = component.profileForm.get('email');

      expect(nameControl?.hasError('required')).toBe(true);
      expect(emailControl?.hasError('required')).toBe(true);

      nameControl?.setValue('ab');
      expect(nameControl?.hasError('minlength')).toBe(true);

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);
    });

    it('should call loadUserProfile and loadAddresses on ngOnInit', () => {
      mockAuthService.getProfile.and.returnValue(of(mockUser));
      mockAddressService.getUserAddresses.and.returnValue(of(mockAddresses));

      spyOn(component, 'loadUserProfile');
      spyOn(component, 'loadAddresses');

      component.ngOnInit();

      expect(component.loadUserProfile).toHaveBeenCalled();
      expect(component.loadAddresses).toHaveBeenCalled();
    });
  });

  describe('Profile Management', () => {
    beforeEach(() => {
      mockAuthService.getProfile.and.returnValue(of(mockUser));
      mockAddressService.getUserAddresses.and.returnValue(of(mockAddresses));
      fixture.detectChanges();
    });

    it('should load user profile successfully', () => {
      component.loadUserProfile();

      expect(component.user()).toEqual(mockUser);
      expect(component.profileForm.get('name')?.value).toBe('Test User');
      expect(component.profileForm.get('email')?.value).toBe('test@example.com');
    });

    it('should handle profile loading error', () => {
      mockAuthService.getProfile.and.returnValue(throwError(() => new Error('Profile load error')));
      spyOn(console, 'error');

      component.loadUserProfile();

      expect(console.error).toHaveBeenCalledWith('Error loading profile:', jasmine.any(Error));
      expect(mockToastr.error).toHaveBeenCalledWith('Error loading profile', 'Error');
    });

    it('should toggle edit profile mode', () => {
      expect(component.isEditingProfile()).toBe(false);

      component.toggleEditProfile();
      expect(component.isEditingProfile()).toBe(true);

      component.toggleEditProfile();
      expect(component.isEditingProfile()).toBe(false);
    });

    it('should reload profile when canceling edit', () => {
      spyOn(component, 'loadUserProfile');
      component.isEditingProfile.set(true);

      component.toggleEditProfile();

      expect(component.loadUserProfile).toHaveBeenCalled();
    });

    it('should save profile successfully', () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockAuthService.updateProfile.and.returnValue(of(updatedUser));

      component.profileForm.patchValue({
        name: 'Updated Name',
        email: 'test@example.com'
      });
      component.isEditingProfile.set(true);

      component.saveProfile();

      expect(mockAuthService.updateProfile).toHaveBeenCalledWith({
        name: 'Updated Name'
      });
      expect(component.user()).toEqual(updatedUser);
      expect(component.isEditingProfile()).toBe(false);
      expect(component.isLoadingProfile()).toBe(false);
      expect(mockToastr.success).toHaveBeenCalledWith('Profile updated successfully', 'Success');
    });

    it('should handle profile save error', () => {
      mockAuthService.updateProfile.and.returnValue(throwError(() => new Error('Save error')));
      spyOn(console, 'error');

      component.profileForm.patchValue({
        name: 'Updated Name',
        email: 'test@example.com'
      });

      component.saveProfile();

      expect(component.isLoadingProfile()).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error updating profile:', jasmine.any(Error));
      expect(mockToastr.error).toHaveBeenCalledWith('Error updating profile', 'Error');
    });

    it('should show validation error when profile form is invalid', () => {
      component.profileForm.patchValue({
        name: '',
        email: 'invalid-email'
      });

      component.saveProfile();

      expect(mockToastr.error).toHaveBeenCalledWith('Please fill in all required fields correctly', 'Error');
    });
  });

  describe('Address Management', () => {
    beforeEach(() => {
      mockAuthService.getProfile.and.returnValue(of(mockUser));
      mockAddressService.getUserAddresses.and.returnValue(of(mockAddresses));
      fixture.detectChanges();
    });

    it('should load addresses successfully', () => {
      component.loadAddresses();

      expect(component.addresses()).toEqual(mockAddresses);
      expect(component.isLoadingAddresses()).toBe(false);
    });

    it('should handle addresses loading error', () => {
      mockAddressService.getUserAddresses.and.returnValue(throwError(() => new Error('Address load error')));
      spyOn(console, 'error');

      component.loadAddresses();

      expect(console.error).toHaveBeenCalledWith('Error loading addresses:', jasmine.any(Error));
      expect(mockToastr.error).toHaveBeenCalledWith('Error loading addresses', 'Error');
      expect(component.isLoadingAddresses()).toBe(false);
    });

    it('should open address modal for new address', () => {
      component.openAddressModal();

      expect(component.showAddressModal()).toBe(true);
      expect(component.editingAddressId()).toBeNull();
      expect(component.addressForm.get('type')?.value).toBe('both');
      expect(component.addressForm.get('isDefault')?.value).toBe(false);
    });

    it('should open address modal for editing existing address', () => {
      const addressToEdit = mockAddresses[0];

      component.openAddressModal(addressToEdit);

      expect(component.showAddressModal()).toBe(true);
      expect(component.editingAddressId()).toBe(addressToEdit.addressId);
      expect(component.addressForm.get('title')?.value).toBe(addressToEdit.title);
      expect(component.addressForm.get('street')?.value).toBe(addressToEdit.street);
    });

    it('should close address modal and reset form', () => {
      component.showAddressModal.set(true);
      component.editingAddressId.set(1);

      component.closeAddressModal();

      expect(component.showAddressModal()).toBe(false);
      expect(component.editingAddressId()).toBeNull();
    });

    it('should create new address successfully', () => {
      const newAddress = { ...mockAddresses[0], addressId: 3, userId: 1, title: 'New Address' };
      mockAddressService.createAddress.and.returnValue(of(newAddress));
      spyOn(component, 'loadAddresses');
      spyOn(component, 'closeAddressModal');

      component.addressForm.patchValue({
        title: 'New Address',
        street: '789 New St',
        city: 'New City',
        state: 'New State',
        zipCode: '11111',
        country: 'New Country',
        type: 'both',
        isDefault: false
      });

      component.saveAddress();

      expect(mockAddressService.createAddress).toHaveBeenCalled();
      expect(component.loadAddresses).toHaveBeenCalled();
      expect(component.closeAddressModal).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Address created successfully', 'Success');
    });

    it('should update existing address successfully', () => {
      const updatedAddress = { ...mockAddresses[0], title: 'Updated Home' };
      mockAddressService.updateAddress.and.returnValue(of(updatedAddress));
      spyOn(component, 'loadAddresses');
      spyOn(component, 'closeAddressModal');

      component.editingAddressId.set(1);
      component.addressForm.patchValue({
        title: 'Updated Home',
        street: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'Test Country',
        type: 'both',
        isDefault: true
      });

      component.saveAddress();

      expect(mockAddressService.updateAddress).toHaveBeenCalledWith(1, jasmine.any(Object));
      expect(component.loadAddresses).toHaveBeenCalled();
      expect(component.closeAddressModal).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Address updated successfully', 'Success');
    });

    it('should handle address save error', () => {
      mockAddressService.createAddress.and.returnValue(throwError(() => new Error('Save error')));
      spyOn(console, 'error');

      component.addressForm.patchValue({
        title: 'New Address',
        street: '789 New St',
        city: 'New City',
        state: 'New State',
        zipCode: '11111',
        country: 'New Country',
        type: 'both',
        isDefault: false
      });

      component.saveAddress();

      expect(component.isLoadingAddresses()).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error saving address:', jasmine.any(Error));
      expect(mockToastr.error).toHaveBeenCalledWith('Error saving address', 'Error');
    });

    it('should show validation error when address form is invalid', () => {
      component.addressForm.patchValue({
        title: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      });

      component.saveAddress();

      expect(mockToastr.error).toHaveBeenCalledWith('Please fill in all required fields correctly', 'Error');
    });

    it('should set default address successfully', () => {
      const updatedAddress = { ...mockAddresses[1], isDefault: true };
      mockAddressService.setDefaultAddress.and.returnValue(of(updatedAddress));
      spyOn(component, 'loadAddresses');

      component.setDefaultAddress(2);

      expect(mockAddressService.setDefaultAddress).toHaveBeenCalledWith(2);
      expect(component.loadAddresses).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Default address updated', 'Success');
    });

    it('should handle set default address error', () => {
      mockAddressService.setDefaultAddress.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');

      component.setDefaultAddress(2);

      expect(console.error).toHaveBeenCalledWith('Error setting default address:', jasmine.any(Error));
      expect(mockToastr.error).toHaveBeenCalledWith('Error setting default address', 'Error');
    });

    it('should delete address after confirmation', () => {
      mockAddressService.deleteAddress.and.returnValue(of(undefined));
      spyOn(component, 'loadAddresses');
      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteAddress(1);

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this address?');
      expect(mockAddressService.deleteAddress).toHaveBeenCalledWith(1);
      expect(component.loadAddresses).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Address deleted successfully', 'Success');
    });

    it('should not delete address if not confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteAddress(1);

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this address?');
      expect(mockAddressService.deleteAddress).not.toHaveBeenCalled();
    });

    it('should handle delete address error', () => {
      mockAddressService.deleteAddress.and.returnValue(throwError(() => new Error('Delete error')));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(console, 'error');

      component.deleteAddress(1);

      expect(console.error).toHaveBeenCalledWith('Error deleting address:', jasmine.any(Error));
      expect(mockToastr.error).toHaveBeenCalledWith('Error deleting address', 'Error');
    });
  });

  describe('Navigation and Actions', () => {
    beforeEach(() => {
      mockAuthService.getProfile.and.returnValue(of(mockUser));
      mockAddressService.getUserAddresses.and.returnValue(of(mockAddresses));
      fixture.detectChanges();
    });

    it('should navigate to home', () => {
      component.goToHome();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should logout', () => {
      component.logout();

      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  describe('Form Getters', () => {
    beforeEach(() => {
      mockAuthService.getProfile.and.returnValue(of(mockUser));
      mockAddressService.getUserAddresses.and.returnValue(of(mockAddresses));
      fixture.detectChanges();
    });

    it('should return correct form controls for profile form', () => {
      expect(component.name).toBe(component.profileForm.get('name'));
      expect(component.email).toBe(component.profileForm.get('email'));
    });

    it('should return correct form controls for address form', () => {
      expect(component.title).toBe(component.addressForm.get('title'));
      expect(component.street).toBe(component.addressForm.get('street'));
      expect(component.city).toBe(component.addressForm.get('city'));
      expect(component.state).toBe(component.addressForm.get('state'));
      expect(component.zipCode).toBe(component.addressForm.get('zipCode'));
      expect(component.country).toBe(component.addressForm.get('country'));
      expect(component.type).toBe(component.addressForm.get('type'));
      expect(component.isDefault).toBe(component.addressForm.get('isDefault'));
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      mockAuthService.getProfile.and.returnValue(of(mockUser));
      mockAddressService.getUserAddresses.and.returnValue(of(mockAddresses));
      fixture.detectChanges();
    });

    it('should validate address form fields correctly', () => {
      const addressForm = component.addressForm;

      // Test required validations
      expect(addressForm.get('title')?.hasError('required')).toBe(true);
      expect(addressForm.get('street')?.hasError('required')).toBe(true);
      expect(addressForm.get('city')?.hasError('required')).toBe(true);
      expect(addressForm.get('state')?.hasError('required')).toBe(true);
      expect(addressForm.get('zipCode')?.hasError('required')).toBe(true);
      expect(addressForm.get('country')?.hasError('required')).toBe(true);

      // Test minlength validations
      addressForm.get('title')?.setValue('a');
      expect(addressForm.get('title')?.hasError('minlength')).toBe(true);

      addressForm.get('street')?.setValue('123');
      expect(addressForm.get('street')?.hasError('minlength')).toBe(true);

      addressForm.get('zipCode')?.setValue('12');
      expect(addressForm.get('zipCode')?.hasError('minlength')).toBe(true);
    });

    it('should mark all form controls as touched when form is invalid', () => {
      const addressForm = component.addressForm;
      const titleControl = addressForm.get('title')!;
      const streetControl = addressForm.get('street')!;

      spyOn(titleControl, 'markAsTouched');
      spyOn(streetControl, 'markAsTouched');

      component.saveAddress();

      expect(titleControl.markAsTouched).toHaveBeenCalled();
      expect(streetControl.markAsTouched).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    beforeEach(() => {
      mockAuthService.getProfile.and.returnValue(of(mockUser));
      mockAddressService.getUserAddresses.and.returnValue(of(mockAddresses));
      fixture.detectChanges();
    });

    it('should manage profile loading state correctly', () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockAuthService.updateProfile.and.callFake(() => {
        expect(component.isLoadingProfile()).toBe(true);
        return of(updatedUser);
      });

      component.profileForm.patchValue({
        name: 'Updated Name',
        email: 'test@example.com'
      });

      component.saveProfile();

      expect(component.isLoadingProfile()).toBe(false);
    });

    it('should manage address loading state correctly', () => {
      mockAddressService.getUserAddresses.and.callFake(() => {
        expect(component.isLoadingAddresses()).toBe(true);
        return of(mockAddresses);
      });

      component.loadAddresses();

      expect(component.isLoadingAddresses()).toBe(false);
    });
  });
});
