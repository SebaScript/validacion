import { Injectable } from '@angular/core';
import { User, RegisterRequest } from '../interfaces/user.interface';
import { Address, CreateAddressRequest } from '../interfaces/address.interface';
import { ToastrService } from 'ngx-toastr';
import { CryptoService } from './crypto.service';

@Injectable({
  providedIn: 'root'
})
export class LocalUserService {
  private readonly USERS_KEY = 'vallmere_users';
  private readonly USER_ID_COUNTER_KEY = 'vallmere_user_id_counter';
  private readonly ADDRESS_ID_COUNTER_KEY = 'vallmere_address_id_counter';

  private initialized = false;

  constructor(
    private toastr: ToastrService,
    private cryptoService: CryptoService
  ) {
    this.init();
  }

  private init(): void {
    if (!this.initialized) {
      this.initialized = true;
      this.initializeDemoUsers()
        .catch(error => console.error('Error initializing demo users:', error));
    }
  }

  // Initialize demo users for testing
  private async initializeDemoUsers(): Promise<void> {
    const existingUsers = this.getAllUsers();
    if (existingUsers.length === 0) {
      try {
        // Create demo admin user
        await this.createUser({
          name: 'Admin Demo',
          email: 'admin@vallmere.com',
          password: 'admin123',
          role: 'admin'
        });

        // Create demo client user
        await this.createUser({
          name: 'Cliente Demo',
          email: 'cliente@vallmere.com',
          password: 'cliente123',
          role: 'client'
        });

        console.log('Demo users created successfully');
      } catch (error) {
        console.error('Error creating demo users:', error);
      }
    }
  }

  // User Management Methods
  async createUser(createUserData: RegisterRequest): Promise<User> {
    const users = this.getAllUsers();

    // Check if email already exists
    const existingUser = users.find(user => user.email.toLowerCase() === createUserData.email.toLowerCase());
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Validate user data
    this.validateUserData(createUserData);

    // Hash password
    const hashedPassword = await this.cryptoService.hashPassword(createUserData.password);

    // Generate new user ID
    const userId = this.getNextUserId();

    // Create user object
    const newUser: User = {
      userId,
      name: createUserData.name.trim(),
      email: createUserData.email.trim().toLowerCase(),
      password: hashedPassword,
      role: createUserData.role || 'client',
      carts: [],
      orders: []
    };

    // Save user
    users.push(newUser);
    this.saveUsers(users);

    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  getAllUsers(): User[] {
    const usersData = localStorage.getItem(this.USERS_KEY);
    return usersData ? JSON.parse(usersData) : [];
  }

  findUserById(id: number): User | null {
    const users = this.getAllUsers();
    const user = users.find(user => user.userId === id);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  findUserByEmail(email: string): User | null {
    const users = this.getAllUsers();
    const user = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(user => user.userId === id);

    if (userIndex === -1) {
      throw new Error(`User with ID ${id} not found`);
    }

    const user = users[userIndex];

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await this.cryptoService.hashPassword(updateData.password);
    }

    // Update user data
    Object.assign(user, updateData);

    // Save updated users
    this.saveUsers(users);

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  removeUser(id: number): void {
    const users = this.getAllUsers();
    const filteredUsers = users.filter(user => user.userId !== id);

    if (filteredUsers.length === users.length) {
      throw new Error(`User with ID ${id} not found`);
    }

    this.saveUsers(filteredUsers);
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return this.cryptoService.comparePasswords(plainPassword, hashedPassword);
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const users = this.getAllUsers();
    const user = users.find(user => user.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return null;
    }

    const isValidPassword = await this.validatePassword(password, user.password!);
    if (!isValidPassword) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Address Management Methods
  getUserAddresses(userId: number): Address[] {
    const addressesData = localStorage.getItem('vallmere_addresses');
    const addresses: Address[] = addressesData ? JSON.parse(addressesData) : [];
    return addresses.filter(address => address.userId === userId);
  }

  createAddress(userId: number, createAddressData: CreateAddressRequest): Address {
    // Validate address data
    this.validateAddressData(createAddressData);

    const addresses = this.getAllAddresses();
    const addressId = this.getNextAddressId();

    // If this is the first address for the user, make it default
    const userAddresses = addresses.filter(addr => addr.userId === userId);
    const isFirstAddress = userAddresses.length === 0;

    const newAddress: Address = {
      addressId,
      userId,
      title: createAddressData.title.trim(),
      street: createAddressData.street.trim(),
      city: createAddressData.city.trim(),
      state: createAddressData.state.trim(),
      zipCode: createAddressData.zipCode.trim(),
      country: createAddressData.country.trim(),
      type: createAddressData.type || 'both',
      isDefault: createAddressData.isDefault !== undefined ? createAddressData.isDefault : isFirstAddress
    };

    // If setting as default, unset other defaults for this user
    if (newAddress.isDefault) {
      addresses.forEach(addr => {
        if (addr.userId === userId) {
          addr.isDefault = false;
        }
      });
    }

    addresses.push(newAddress);
    this.saveAddresses(addresses);

    return newAddress;
  }

  getAddress(addressId: number, userId: number): Address | null {
    const addresses = this.getAllAddresses();
    return addresses.find(addr => addr.addressId === addressId && addr.userId === userId) || null;
  }

  updateAddress(addressId: number, userId: number, updateData: Partial<CreateAddressRequest>): Address {
    const addresses = this.getAllAddresses();
    const addressIndex = addresses.findIndex(addr => addr.addressId === addressId && addr.userId === userId);

    if (addressIndex === -1) {
      throw new Error(`Address with ID ${addressId} not found`);
    }

    // If setting as default, unset other defaults for this user
    if (updateData.isDefault) {
      addresses.forEach(addr => {
        if (addr.userId === userId) {
          addr.isDefault = false;
        }
      });
    }

    // Update address data
    Object.assign(addresses[addressIndex], updateData);

    this.saveAddresses(addresses);
    return addresses[addressIndex];
  }

  setDefaultAddress(addressId: number, userId: number): Address {
    const addresses = this.getAllAddresses();
    const address = addresses.find(addr => addr.addressId === addressId && addr.userId === userId);

    if (!address) {
      throw new Error(`Address with ID ${addressId} not found`);
    }

    // Unset all other defaults for this user
    addresses.forEach(addr => {
      if (addr.userId === userId) {
        addr.isDefault = false;
      }
    });

    // Set this address as default
    address.isDefault = true;

    this.saveAddresses(addresses);
    return address;
  }

  removeAddress(addressId: number, userId: number): void {
    const addresses = this.getAllAddresses();
    const filteredAddresses = addresses.filter(addr => !(addr.addressId === addressId && addr.userId === userId));

    if (filteredAddresses.length === addresses.length) {
      throw new Error(`Address with ID ${addressId} not found`);
    }

    this.saveAddresses(filteredAddresses);
  }

  // Private helper methods
  private validateUserData(userData: RegisterRequest): void {
    if (!userData.name || userData.name.trim().length < 3) {
      throw new Error('Name must be at least 3 characters');
    }

    if (!userData.email || !this.isValidEmail(userData.email)) {
      throw new Error('Please enter a valid email address');
    }

    if (!userData.password || userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    if (userData.role && !['admin', 'client'].includes(userData.role)) {
      throw new Error('Role must be admin or client');
    }
  }

  private validateAddressData(addressData: CreateAddressRequest): void {
    if (!addressData.title || addressData.title.trim().length < 2) {
      throw new Error('Title must be at least 2 characters');
    }

    if (!addressData.street || addressData.street.trim().length < 5) {
      throw new Error('Street must be at least 5 characters');
    }

    if (!addressData.city || addressData.city.trim().length < 2) {
      throw new Error('City must be at least 2 characters');
    }

    if (!addressData.state || addressData.state.trim().length < 2) {
      throw new Error('State must be at least 2 characters');
    }

    if (!addressData.zipCode || addressData.zipCode.trim().length < 3) {
      throw new Error('Zip code must be at least 3 characters');
    }

    if (!addressData.country || addressData.country.trim().length < 2) {
      throw new Error('Country must be at least 2 characters');
    }

    if (addressData.type && !['shipping', 'billing', 'both'].includes(addressData.type)) {
      throw new Error('Type must be shipping, billing, or both');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Check for consecutive dots which are invalid
    if (email.includes('..')) {
      return false;
    }
    return emailRegex.test(email);
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  private getAllAddresses(): Address[] {
    const addressesData = localStorage.getItem('vallmere_addresses');
    return addressesData ? JSON.parse(addressesData) : [];
  }

  private saveAddresses(addresses: Address[]): void {
    localStorage.setItem('vallmere_addresses', JSON.stringify(addresses));
  }

  private getNextUserId(): number {
    const currentId = parseInt(localStorage.getItem(this.USER_ID_COUNTER_KEY) || '0') || 0;
    const nextId = currentId + 1;
    localStorage.setItem(this.USER_ID_COUNTER_KEY, nextId.toString());
    return nextId;
  }

  private getNextAddressId(): number {
    const currentId = parseInt(localStorage.getItem(this.ADDRESS_ID_COUNTER_KEY) || '0') || 0;
    const nextId = currentId + 1;
    localStorage.setItem(this.ADDRESS_ID_COUNTER_KEY, nextId.toString());
    return nextId;
  }
}
