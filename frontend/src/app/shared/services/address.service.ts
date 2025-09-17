import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { LocalUserService } from './local-user.service';
import { AuthService } from './auth.service';
import { Address, CreateAddressRequest, UpdateAddressRequest } from '../interfaces/address.interface';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private readonly endpoint = 'users/profile/addresses';

  constructor(
    private readonly localUserService: LocalUserService,
    private readonly authService: AuthService
  ) {}

  getUserAddresses(): Observable<Address[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return throwError(() => new Error('No authenticated user'));
    }

    const addresses = this.localUserService.getUserAddresses(currentUser.userId);
    return from(Promise.resolve(addresses));
  }

  getAddress(id: number): Observable<Address> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return throwError(() => new Error('No authenticated user'));
    }

    const address = this.localUserService.getAddress(id, currentUser.userId);
    if (!address) {
      return throwError(() => new Error(`Address with ID ${id} not found`));
    }
    return from(Promise.resolve(address));
  }

  createAddress(address: CreateAddressRequest): Observable<Address> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return throwError(() => new Error('No authenticated user'));
    }

    try {
      const newAddress = this.localUserService.createAddress(currentUser.userId, address);
      return from(Promise.resolve(newAddress));
    } catch (error: any) {
      return throwError(() => error);
    }
  }

  updateAddress(id: number, address: UpdateAddressRequest): Observable<Address> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return throwError(() => new Error('No authenticated user'));
    }

    try {
      const updatedAddress = this.localUserService.updateAddress(id, currentUser.userId, address);
      return from(Promise.resolve(updatedAddress));
    } catch (error: any) {
      return throwError(() => error);
    }
  }

  setDefaultAddress(id: number): Observable<Address> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return throwError(() => new Error('No authenticated user'));
    }

    try {
      const defaultAddress = this.localUserService.setDefaultAddress(id, currentUser.userId);
      return from(Promise.resolve(defaultAddress));
    } catch (error: any) {
      return throwError(() => error);
    }
  }

  deleteAddress(id: number): Observable<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      return throwError(() => new Error('No authenticated user'));
    }

    try {
      this.localUserService.removeAddress(id, currentUser.userId);
      return from(Promise.resolve());
    } catch (error: any) {
      return throwError(() => error);
    }
  }
}
