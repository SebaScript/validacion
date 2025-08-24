import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../shared/services/auth.service';
import { AddressService } from '../../shared/services/address.service';
import { User } from '../../shared/interfaces/user.interface';
import { Address, CreateAddressRequest } from '../../shared/interfaces/address.interface';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
})
export class ProfileComponent implements OnInit {
  // User data
  user = signal<User | null>(null);
  isEditingProfile = signal(false);
  isLoadingProfile = signal(false);
  profileForm: FormGroup;

  // Address data
  addresses = signal<Address[]>([]);
  isEditingAddress = signal(false);
  isLoadingAddresses = signal(false);
  editingAddressId = signal<number | null>(null);
  addressForm: FormGroup;

  // Modal controls
  showAddressModal = signal(false);

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
    private addressService: AddressService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.addressForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      street: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      zipCode: ['', [Validators.required, Validators.minLength(3)]],
      country: ['', [Validators.required, Validators.minLength(2)]],
      type: ['both', Validators.required],
      isDefault: [false]
    });
  }

  ngOnInit() {
    this.loadUserProfile();
    this.loadAddresses();
  }

  // Profile methods
  loadUserProfile() {
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.user.set(user);
        this.profileForm.patchValue({
          name: user.name,
          email: user.email
        });
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.toastr.error('Error loading profile', 'Error');
      }
    });
  }

  toggleEditProfile() {
    this.isEditingProfile.update(value => !value);
    if (!this.isEditingProfile()) {
      this.loadUserProfile(); // Reset form if canceling
    }
  }

  saveProfile() {
    if (this.profileForm.valid) {
      this.isLoadingProfile.set(true);
      const formData = this.profileForm.value;
      const { email, ...updateData } = formData; // Remove email as it's not editable

      this.authService.updateProfile(updateData).subscribe({
        next: (updatedUser) => {
          this.isLoadingProfile.set(false);
          this.isEditingProfile.set(false);
          this.user.set(updatedUser);
          this.toastr.success('Profile updated successfully', 'Success');
        },
        error: (error) => {
          this.isLoadingProfile.set(false);
          console.error('Error updating profile:', error);
          this.toastr.error('Error updating profile', 'Error');
        }
      });
    } else {
      this.markFormGroupTouched(this.profileForm);
      this.toastr.error('Please fill in all required fields correctly', 'Error');
    }
  }

  // Address methods
  loadAddresses() {
    this.isLoadingAddresses.set(true);
    this.addressService.getUserAddresses().subscribe({
      next: (addresses) => {
        this.addresses.set(addresses);
        this.isLoadingAddresses.set(false);
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
        this.toastr.error('Error loading addresses', 'Error');
        this.isLoadingAddresses.set(false);
      }
    });
  }

  openAddressModal(address?: Address) {
    this.showAddressModal.set(true);
    if (address) {
      this.editingAddressId.set(address.addressId);
      this.addressForm.patchValue(address);
    } else {
      this.editingAddressId.set(null);
      this.addressForm.reset({
        type: 'both',
        isDefault: false
      });
    }
  }

  closeAddressModal() {
    this.showAddressModal.set(false);
    this.editingAddressId.set(null);
    this.addressForm.reset();
  }

  saveAddress() {
    if (this.addressForm.valid) {
      this.isLoadingAddresses.set(true);
      const addressData: CreateAddressRequest = this.addressForm.value;
      const addressId = this.editingAddressId();

      const operation = addressId
        ? this.addressService.updateAddress(addressId, addressData)
        : this.addressService.createAddress(addressData);

      operation.subscribe({
        next: (address) => {
          this.isLoadingAddresses.set(false);
          this.loadAddresses(); // Reload all addresses
          this.closeAddressModal();
          this.toastr.success(
            addressId ? 'Address updated successfully' : 'Address created successfully',
            'Success'
          );
        },
        error: (error) => {
          this.isLoadingAddresses.set(false);
          console.error('Error saving address:', error);
          this.toastr.error('Error saving address', 'Error');
        }
      });
    } else {
      this.markFormGroupTouched(this.addressForm);
      this.toastr.error('Please fill in all required fields correctly', 'Error');
    }
  }

  setDefaultAddress(addressId: number) {
    this.addressService.setDefaultAddress(addressId).subscribe({
      next: () => {
        this.loadAddresses(); // Reload to update default status
        this.toastr.success('Default address updated', 'Success');
      },
      error: (error) => {
        console.error('Error setting default address:', error);
        this.toastr.error('Error setting default address', 'Error');
      }
    });
  }

  deleteAddress(addressId: number) {
    if (confirm('Are you sure you want to delete this address?')) {
      this.addressService.deleteAddress(addressId).subscribe({
        next: () => {
          this.loadAddresses(); // Reload addresses
          this.toastr.success('Address deleted successfully', 'Success');
        },
        error: (error) => {
          console.error('Error deleting address:', error);
          this.toastr.error('Error deleting address', 'Error');
        }
      });
    }
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  logout() {
    this.authService.logout();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getters for form controls
  get name() { return this.profileForm.get('name'); }
  get email() { return this.profileForm.get('email'); }

  get title() { return this.addressForm.get('title'); }
  get street() { return this.addressForm.get('street'); }
  get city() { return this.addressForm.get('city'); }
  get state() { return this.addressForm.get('state'); }
  get zipCode() { return this.addressForm.get('zipCode'); }
  get country() { return this.addressForm.get('country'); }
  get type() { return this.addressForm.get('type'); }
  get isDefault() { return this.addressForm.get('isDefault'); }
}
