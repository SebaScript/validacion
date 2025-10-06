import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';
import { of, throwError, BehaviorSubject } from 'rxjs';

import { CartService } from './cart.service';
import { LocalCartService } from './local-cart.service';
import { AuthService } from './auth.service';
import { Product } from '../interfaces/product.interface';
import { CartItem, Cart, CartTotal } from '../interfaces/cart.interface';
import { User } from '../interfaces/user.interface';

describe('CartService', () => {
  let service: CartService;
  let mockLocalCartService: jasmine.SpyObj<LocalCartService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let currentUserSubject: BehaviorSubject<User | null>;

  const mockUser: User = {
    userId: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'client'
  };

  const mockProduct: Product = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 29.99,
    stock: 10,
    imageUrl: 'http://example.com/image.jpg',
    categoryId: 1
  };

  const mockCartItem: CartItem = {
    cartItemId: 1,
    cartId: 1,
    productId: 1,
    quantity: 2,
    product: mockProduct
  };

  const mockCart: Cart = {
    cartId: 1,
    userId: 1,
    items: [mockCartItem]
  };

  beforeEach(() => {
    currentUserSubject = new BehaviorSubject<User | null>(null);

    const localCartServiceSpy = jasmine.createSpyObj('LocalCartService', [
      'findCartByUserId', 'addItemByUserId', 'updateItemQuantity',
      'removeItem', 'clearCart', 'getCartTotal'
    ]);

    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getCurrentUser'
    ]);
    authServiceSpy.currentUser$ = currentUserSubject.asObservable();

    const toastrSpy = jasmine.createSpyObj('ToastrService', [
      'success', 'error', 'info'
    ]);

    TestBed.configureTestingModule({
      providers: [
        CartService,
        { provide: LocalCartService, useValue: localCartServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    });

    mockLocalCartService = TestBed.inject(LocalCartService) as jasmine.SpyObj<LocalCartService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockToastr = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;

    service = TestBed.inject(CartService);
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with empty cart', () => {
      expect(service.items()).toEqual([]);
      expect(service.totalItems()).toBe(0);
      expect(service.totalAmount()).toBe(0);
      expect(service.loading()).toBe(false);
      expect(service.getCurrentCartId()).toBeNull();
    });

    it('should load cart when user logs in', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      mockLocalCartService.findCartByUserId.and.returnValue(mockCart);

      currentUserSubject.next(mockUser);

      expect(mockLocalCartService.findCartByUserId).toHaveBeenCalledWith(1);
      expect(service.items()).toEqual([mockCartItem]);
      expect(service.getCurrentCartId()).toBe(1);
    });

    it('should clear cart when user logs out', () => {
      // First login
      currentUserSubject.next(mockUser);

      // Then logout
      currentUserSubject.next(null);

      expect(service.items()).toEqual([]);
      expect(service.getCurrentCartId()).toBeNull();
    });

    it('should handle user without userId', () => {
      const userWithoutId = { ...mockUser, userId: undefined };
      mockAuthService.getCurrentUser.and.returnValue(userWithoutId);

      currentUserSubject.next(userWithoutId);

      expect(mockLocalCartService.findCartByUserId).not.toHaveBeenCalled();
    });

    it('should create empty cart when no cart exists for user', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      mockLocalCartService.findCartByUserId.and.returnValue(null);

      currentUserSubject.next(mockUser);

      expect(service.items()).toEqual([]);
      expect(service.getCurrentCartId()).toBeNull();
    });

    it('should handle cart loading errors', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      mockLocalCartService.findCartByUserId.and.throwError('Storage error');
      spyOn(console, 'error');

      currentUserSubject.next(mockUser);

      expect(console.error).toHaveBeenCalledWith('Error loading cart:', jasmine.any(Error));
      expect(mockToastr.error).toHaveBeenCalledWith('Error loading cart', 'Cart Error');
      expect(service.loading()).toBe(false);
    });
  });

  describe('Computed Properties', () => {
    beforeEach(() => {
      service['cartItems'].set([mockCartItem]);
    });

    it('should compute total items correctly', () => {
      expect(service.totalItems()).toBe(2); // quantity of mockCartItem
    });

    it('should compute total amount correctly', () => {
      expect(service.totalAmount()).toBe(59.98); // 2 * 29.99
    });

    it('should update computed values when items change', () => {
      const newItem: CartItem = {
        cartItemId: 2,
        cartId: 1,
        productId: 2,
        quantity: 1,
        product: { ...mockProduct, id: 2, price: 19.99 }
      };

      service['cartItems'].set([mockCartItem, newItem]);

      expect(service.totalItems()).toBe(3); // 2 + 1
      expect(service.totalAmount()).toBe(79.97); // 59.98 + 19.99
    });

    it('should handle empty cart in computed properties', () => {
      service['cartItems'].set([]);

      expect(service.totalItems()).toBe(0);
      expect(service.totalAmount()).toBe(0);
    });
  });

  describe('addToCart', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      service['cartId'].set(1);
    });

    it('should add item to cart successfully', fakeAsync(() => {
      mockLocalCartService.addItemByUserId.and.returnValue(Promise.resolve(mockCartItem));
      mockLocalCartService.findCartByUserId.and.returnValue(mockCart);
      let result: CartItem | void | undefined;

      service.addToCart(mockProduct, 2).subscribe(item => result = item);
      tick();

      expect(mockLocalCartService.addItemByUserId).toHaveBeenCalledWith(1, {
        productId: 1,
        quantity: 2
      });
      expect(result).toBeDefined();
      expect(service.loading()).toBe(false);
      expect(mockToastr.success).toHaveBeenCalledWith('Test Product added to cart!', 'Cart Updated');
    }));

    it('should use default quantity of 1', fakeAsync(() => {
      mockLocalCartService.addItemByUserId.and.returnValue(Promise.resolve(mockCartItem));
      mockLocalCartService.findCartByUserId.and.returnValue(mockCart);

      service.addToCart(mockProduct).subscribe();
      tick();

      expect(mockLocalCartService.addItemByUserId).toHaveBeenCalledWith(1, {
        productId: 1,
        quantity: 1
      });
    }));

    it('should handle unauthenticated user', (done) => {
      mockAuthService.getCurrentUser.and.returnValue(null);

      service.addToCart(mockProduct).subscribe({
        error: (error) => {
          expect(error.message).toBe('User not logged in');
          expect(mockToastr.error).toHaveBeenCalledWith('Please log in to add items to cart', 'Authentication Required');
          done();
        }
      });
    });

    it('should handle user without userId', (done) => {
      const userWithoutId = { ...mockUser, userId: undefined };
      mockAuthService.getCurrentUser.and.returnValue(userWithoutId);

      service.addToCart(mockProduct).subscribe({
        error: (error) => {
          expect(error.message).toBe('User not logged in');
          expect(mockToastr.error).toHaveBeenCalledWith('Please log in to add items to cart', 'Authentication Required');
          done();
        }
      });
    });

    it('should handle add to cart errors', fakeAsync(() => {
      const error = new Error('Storage full');
      mockLocalCartService.addItemByUserId.and.returnValue(Promise.reject(error));
      let errorResult: Error | undefined;

      service.addToCart(mockProduct).subscribe({
        error: (err) => errorResult = err
      });
      tick();

      expect(errorResult).toBe(error);
      expect(service.loading()).toBe(false);
      expect(mockToastr.error).toHaveBeenCalledWith('Storage full', 'Cart Error');
    }));

    it('should handle add to cart errors with generic message', fakeAsync(() => {
      mockLocalCartService.addItemByUserId.and.returnValue(Promise.reject({}));

      service.addToCart(mockProduct).subscribe({
        error: () => {}
      });
      tick();

      expect(mockToastr.error).toHaveBeenCalledWith('Failed to add item to cart', 'Cart Error');
    }));

    it('should set loading state correctly', fakeAsync(() => {
      mockLocalCartService.addItemByUserId.and.returnValue(Promise.resolve(mockCartItem));
      mockLocalCartService.findCartByUserId.and.returnValue(mockCart);

      expect(service.loading()).toBe(false);

      service.addToCart(mockProduct).subscribe();
      expect(service.loading()).toBe(true);

      tick();
      expect(service.loading()).toBe(false);
    }));
  });

  describe('updateQuantity', () => {
    beforeEach(() => {
      service['cartId'].set(1);
      service['cartItems'].set([mockCartItem]);
    });

    it('should update quantity successfully', fakeAsync(() => {
      mockLocalCartService.updateItemQuantity.and.returnValue(Promise.resolve(mockCartItem));
      mockLocalCartService.findCartByUserId.and.returnValue(mockCart);
      mockAuthService.getCurrentUser.and.returnValue(mockUser);

      service.updateQuantity(1, 3).subscribe();
      tick();

      expect(mockLocalCartService.updateItemQuantity).toHaveBeenCalledWith(1, 1, 3);
      expect(service.loading()).toBe(false);
      expect(mockToastr.success).toHaveBeenCalledWith('Cart updated successfully', 'Cart Updated');
    }));

    it('should remove item when quantity is less than 1', () => {
      spyOn(service, 'removeFromCart').and.returnValue(of(void 0));

      service.updateQuantity(1, 0).subscribe();

      expect(service.removeFromCart).toHaveBeenCalledWith(1);
    });

    it('should handle no cart available', (done) => {
      service['cartId'].set(null);

      service.updateQuantity(1, 2).subscribe({
        error: (error) => {
          expect(error.message).toBe('No cart available');
          done();
        }
      });
    });

    it('should handle update quantity errors', fakeAsync(() => {
      const error = new Error('Update failed');
      mockLocalCartService.updateItemQuantity.and.returnValue(Promise.reject(error));
      let errorResult: Error | undefined;

      service.updateQuantity(1, 3).subscribe({
        error: (err) => errorResult = err
      });
      tick();

      expect(errorResult).toBe(error);
      expect(service.loading()).toBe(false);
      expect(mockToastr.error).toHaveBeenCalledWith('Update failed', 'Cart Error');
    }));

    it('should handle update quantity errors with generic message', fakeAsync(() => {
      mockLocalCartService.updateItemQuantity.and.returnValue(Promise.reject({}));

      service.updateQuantity(1, 3).subscribe({
        error: () => {}
      });
      tick();

      expect(mockToastr.error).toHaveBeenCalledWith('Failed to update cart', 'Cart Error');
    }));
  });

  describe('removeFromCart', () => {
    beforeEach(() => {
      service['cartId'].set(1);
      service['cartItems'].set([mockCartItem]);
    });

    it('should remove item from cart successfully', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      mockLocalCartService.findCartByUserId.and.returnValue({ ...mockCart, items: [] });

      service.removeFromCart(1).subscribe();

      expect(mockLocalCartService.removeItem).toHaveBeenCalledWith(1, 1);
      expect(service.loading()).toBe(false);
      expect(mockToastr.success).toHaveBeenCalledWith('Item removed from cart', 'Cart Updated');
    });

    it('should handle no cart available', (done) => {
      service['cartId'].set(null);

      service.removeFromCart(1).subscribe({
        error: (error) => {
          expect(error.message).toBe('No cart available');
          done();
        }
      });
    });

    it('should handle remove item errors', (done) => {
      const error = new Error('Remove failed');
      mockLocalCartService.removeItem.and.throwError(error);

      service.removeFromCart(1).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          expect(service.loading()).toBe(false);
          expect(mockToastr.error).toHaveBeenCalledWith('Remove failed', 'Cart Error');
          done();
        }
      });
    });

    it('should handle remove item errors with generic message', (done) => {
      mockLocalCartService.removeItem.and.throwError('Remove error');

      service.removeFromCart(1).subscribe({
        error: () => {
          expect(mockToastr.error).toHaveBeenCalledWith('Remove error', 'Cart Error');
          done();
        }
      });
    });
  });

  describe('clearCart', () => {
    beforeEach(() => {
      service['cartId'].set(1);
      service['cartItems'].set([mockCartItem]);
    });

    it('should clear cart successfully', () => {
      service.clearCart().subscribe();

      expect(mockLocalCartService.clearCart).toHaveBeenCalledWith(1);
      expect(service.items()).toEqual([]);
      expect(service.loading()).toBe(false);
      expect(mockToastr.success).toHaveBeenCalledWith('Cart cleared successfully', 'Cart Updated');
    });

    it('should handle no cart available', (done) => {
      service['cartId'].set(null);

      service.clearCart().subscribe({
        error: (error) => {
          expect(error.message).toBe('No cart available');
          done();
        }
      });
    });

    it('should handle clear cart errors', (done) => {
      const error = new Error('Clear failed');
      mockLocalCartService.clearCart.and.throwError(error);

      service.clearCart().subscribe({
        error: (err) => {
          expect(err).toBe(error);
          expect(service.loading()).toBe(false);
          expect(mockToastr.error).toHaveBeenCalledWith('Clear failed', 'Cart Error');
          done();
        }
      });
    });

    it('should handle clear cart errors with generic message', (done) => {
      mockLocalCartService.clearCart.and.throwError('Clear error');

      service.clearCart().subscribe({
        error: () => {
          expect(mockToastr.error).toHaveBeenCalledWith('Clear error', 'Cart Error');
          done();
        }
      });
    });
  });

  describe('getCartTotal', () => {
    it('should return cart total when cart exists', (done) => {
      const mockTotal: CartTotal = { itemCount: 2, total: 59.98 };
      service['cartId'].set(1);
      mockLocalCartService.getCartTotal.and.returnValue(mockTotal);

      service.getCartTotal().subscribe(total => {
        expect(total).toEqual(mockTotal);
        expect(mockLocalCartService.getCartTotal).toHaveBeenCalledWith(1);
        done();
      });
    });

    it('should return zero total when no cart exists', (done) => {
      service['cartId'].set(null);

      service.getCartTotal().subscribe(total => {
        expect(total).toEqual({ itemCount: 0, total: 0 });
        done();
      });
    });
  });

  describe('Helper Methods', () => {
    it('should refresh cart', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      mockLocalCartService.findCartByUserId.and.returnValue(mockCart);

      service.refreshCart();

      expect(mockLocalCartService.findCartByUserId).toHaveBeenCalledWith(1);
    });

    it('should get current cart ID', () => {
      service['cartId'].set(123);

      expect(service.getCurrentCartId()).toBe(123);
    });

    it('should return null when no cart ID', () => {
      service['cartId'].set(null);

      expect(service.getCurrentCartId()).toBeNull();
    });

    it('should clear cart data', () => {
      service['cartItems'].set([mockCartItem]);
      service['cartId'].set(1);

      service['clearCartData']();

      expect(service.items()).toEqual([]);
      expect(service.getCurrentCartId()).toBeNull();
    });
  });

  describe('Signal Reactivity', () => {
    it('should update computed values when cart items change', () => {
      expect(service.totalItems()).toBe(0);
      expect(service.totalAmount()).toBe(0);

      service['cartItems'].set([mockCartItem]);

      expect(service.totalItems()).toBe(2);
      expect(service.totalAmount()).toBe(59.98);
    });

    it('should provide readonly signals', () => {
      expect(service.items).toBeDefined();
      expect(service.loading).toBeDefined();

      // These should be readonly signals - set method should not exist
      expect((service.items as any).set).toBeUndefined();
      expect((service.loading as any).set).toBeUndefined();
    });

    it('should handle multiple cart items in computed values', () => {
      const items: CartItem[] = [
        mockCartItem,
        {
          cartItemId: 2,
          cartId: 1,
          productId: 2,
          quantity: 1,
          product: { ...mockProduct, id: 2, price: 19.99 }
        },
        {
          cartItemId: 3,
          cartId: 1,
          productId: 3,
          quantity: 3,
          product: { ...mockProduct, id: 3, price: 9.99 }
        }
      ];

      service['cartItems'].set(items);

      expect(service.totalItems()).toBe(6); // 2 + 1 + 3
      expect(service.totalAmount()).toBe(109.94); // 59.98 + 19.99 + 29.97
    });
  });

  describe('User Authentication Integration', () => {
    it('should handle multiple user login/logout cycles', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      mockLocalCartService.findCartByUserId.and.returnValue(mockCart);

      // Login
      currentUserSubject.next(mockUser);
      expect(service.items().length).toBe(1);

      // Logout
      currentUserSubject.next(null);
      expect(service.items().length).toBe(0);

      // Login again
      currentUserSubject.next(mockUser);
      expect(service.items().length).toBe(1);
    });

    it('should handle user switching', () => {
      const user2: User = { ...mockUser, userId: 2, name: 'User 2' };
      const cart2: Cart = {
        cartId: 2,
        userId: 2,
        items: [{ ...mockCartItem, cartItemId: 2, cartId: 2 }]
      };

      // Login user 1
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      mockLocalCartService.findCartByUserId.and.returnValue(mockCart);
      currentUserSubject.next(mockUser);
      expect(service.getCurrentCartId()).toBe(1);

      // Switch to user 2
      mockAuthService.getCurrentUser.and.returnValue(user2);
      mockLocalCartService.findCartByUserId.and.returnValue(cart2);
      currentUserSubject.next(user2);
      expect(service.getCurrentCartId()).toBe(2);
    });

    it('should handle authentication errors during cart operations', fakeAsync(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      service['cartId'].set(1);

      // User logs out during operation
      mockAuthService.getCurrentUser.and.returnValue(null);

      service.addToCart(mockProduct).subscribe({
        error: (error) => {
          expect(error.message).toBe('User not logged in');
        }
      });
    }));
  });

  describe('Error Scenarios and Edge Cases', () => {
    it('should handle concurrent cart operations', fakeAsync(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      mockLocalCartService.addItemByUserId.and.returnValue(Promise.resolve(mockCartItem));
      mockLocalCartService.findCartByUserId.and.returnValue(mockCart);

      service.addToCart(mockProduct, 1).subscribe();
      service.addToCart(mockProduct, 2).subscribe();

      tick();

      expect(mockLocalCartService.addItemByUserId).toHaveBeenCalledTimes(2);
    }));

    it('should handle large quantities', fakeAsync(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      const largeQuantityItem = { ...mockCartItem, quantity: 1000 };
      mockLocalCartService.addItemByUserId.and.returnValue(Promise.resolve(largeQuantityItem));
      mockLocalCartService.findCartByUserId.and.returnValue({
        ...mockCart,
        items: [largeQuantityItem]
      });

      service.addToCart(mockProduct, 1000).subscribe();
      tick();

      service['cartItems'].set([largeQuantityItem]);
      expect(service.totalItems()).toBe(1000);
      expect(service.totalAmount()).toBe(29990); // 1000 * 29.99
    }));

    it('should handle products with zero price', () => {
      const freeProduct = { ...mockProduct, price: 0 };
      const freeItem = { ...mockCartItem, product: freeProduct };

      service['cartItems'].set([freeItem]);

      expect(service.totalAmount()).toBe(0);
      expect(service.totalItems()).toBe(2);
    });

    it('should handle empty product name in notifications', fakeAsync(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      const productWithoutName = { ...mockProduct, name: '' };
      mockLocalCartService.addItemByUserId.and.returnValue(Promise.resolve(mockCartItem));
      mockLocalCartService.findCartByUserId.and.returnValue(mockCart);

      service.addToCart(productWithoutName).subscribe();
      tick();

      expect(mockToastr.success).toHaveBeenCalledWith(' added to cart!', 'Cart Updated');
    }));

    it('should handle storage quota errors', fakeAsync(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      mockLocalCartService.addItemByUserId.and.returnValue(
        Promise.reject(new Error('QuotaExceededError'))
      );

      service.addToCart(mockProduct).subscribe({
        error: (error) => {
          expect(error.message).toBe('QuotaExceededError');
          expect(mockToastr.error).toHaveBeenCalledWith('QuotaExceededError', 'Cart Error');
        }
      });
      tick();
    }));

    it('should handle corrupted cart data', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      mockLocalCartService.findCartByUserId.and.returnValue({
        cartId: 1,
        userId: 1,
        items: null as any // Corrupted data
      });

      currentUserSubject.next(mockUser);

      expect(service.items()).toEqual([]); // Should fallback to empty array
    });
  });

  describe('Performance and Memory Management', () => {
    it('should not create memory leaks with multiple subscriptions', () => {
      const subscriptions = [];

      for (let i = 0; i < 100; i++) {
        subscriptions.push(currentUserSubject.subscribe());
      }

      currentUserSubject.next(mockUser);
      currentUserSubject.next(null);

      // Unsubscribe all
      subscriptions.forEach(sub => sub.unsubscribe());

      expect(service.items()).toEqual([]);
    });

    it('should handle rapid user state changes', () => {
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      mockLocalCartService.findCartByUserId.and.returnValue(mockCart);

      // Rapid user state changes
      for (let i = 0; i < 10; i++) {
        currentUserSubject.next(mockUser);
        currentUserSubject.next(null);
      }

      expect(service.items()).toEqual([]);
      expect(service.getCurrentCartId()).toBeNull();
    });

    it('should handle large cart with many items', () => {
      const manyItems = Array.from({ length: 100 }, (_, i) => ({
        cartItemId: i + 1,
        cartId: 1,
        productId: i + 1,
        quantity: 1,
        product: { ...mockProduct, id: i + 1, price: 10 }
      }));

      service['cartItems'].set(manyItems);

      const startTime = performance.now();
      const totalItems = service.totalItems();
      const totalAmount = service.totalAmount();
      const endTime = performance.now();

      expect(totalItems).toBe(100);
      expect(totalAmount).toBe(1000);
      expect(endTime - startTime).toBeLessThan(10); // Should be fast
    });
  });

  describe('Type Safety and Interfaces', () => {
    it('should properly type cart items', () => {
      const typedItem: CartItem = {
        cartItemId: 1,
        cartId: 1,
        productId: 1,
        quantity: 1,
        product: mockProduct
      };

      service['cartItems'].set([typedItem]);
      const items = service.items();

      expect(items[0].cartItemId).toBe(1);
      expect(items[0].product.name).toBe('Test Product');
    });

    it('should properly type cart total', (done) => {
      service['cartId'].set(1);
      const mockTotal: CartTotal = { itemCount: 5, total: 99.99 };
      mockLocalCartService.getCartTotal.and.returnValue(mockTotal);

      service.getCartTotal().subscribe(total => {
        expect(typeof total.itemCount).toBe('number');
        expect(typeof total.total).toBe('number');
        expect(total.itemCount).toBe(5);
        expect(total.total).toBe(99.99);
        done();
      });
    });
  });
});
