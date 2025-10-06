import { Injectable, computed, signal } from '@angular/core';
import { Observable, of, throwError, from } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { LocalCartService } from './local-cart.service';
import { AuthService } from './auth.service';
import { Product } from '../interfaces/product.interface';
import { CartItem } from '../interfaces/cart.interface';

// Re-export interfaces for backward compatibility
export type { CartItem, Cart, CartTotal } from '../interfaces/cart.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly cartItems = signal<CartItem[]>([]);
  private readonly cartId = signal<number | null>(null);
  private readonly isLoading = signal<boolean>(false);

  totalItems = computed(() => this.cartItems().reduce((total, item) => total + item.quantity, 0));
  totalAmount = computed(() => this.cartItems().reduce((total, item) => total + (item.quantity * item.product.price), 0));

  items = this.cartItems.asReadonly();
  loading = this.isLoading.asReadonly();

  constructor(
    private readonly localCartService: LocalCartService,
    private readonly authService: AuthService,
    private readonly toastr: ToastrService
  ) {
    // Initialize cart when user logs in
    this.authService.currentUser$.subscribe((user: any) => {
      if (user) {
        this.loadCart();
      } else {
        this.clearCartData();
      }
    });
  }

  private loadCart(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.userId) {
      return throwError(() => new Error('No authenticated user'));
    }

    this.isLoading.set(true);

    try {
      const cart = this.localCartService.findCartByUserId(currentUser.userId);
      this.isLoading.set(false);

      if (cart) {
        this.cartId.set(cart.cartId);
        this.cartItems.set(cart.items || []);
      } else {
        // No cart found, will be created when first item is added
        this.cartId.set(null);
        this.cartItems.set([]);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      this.toastr.error('Error loading cart', 'Cart Error');
      this.isLoading.set(false);
    }
  }

  addToCart(product: Product, quantity: number = 1): Observable<CartItem | void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.userId) {
      return throwError(() => new Error('No authenticated user'));
    }

    const addItemRequest = {
      productId: product.id,
      quantity: quantity
    };

    this.isLoading.set(true);

    return from(this.localCartService.addItemByUserId(currentUser.userId, addItemRequest)).pipe(
      tap(cartItem => {
        this.isLoading.set(false);
        this.loadCart(); // Reload cart to get updated data
        this.toastr.success(`${product.name} added to cart!`, 'Cart Updated');
      }),
      catchError(error => {
        this.isLoading.set(false);
        const errorMessage = error.message || 'Failed to add item to cart';
        this.toastr.error(errorMessage, 'Cart Error');
        return throwError(() => error);
      })
    );
  }

  updateQuantity(itemId: number, quantity: number): Observable<void> {
    if (!this.cartId()) {
      return throwError(() => new Error('No cart available'));
    }

    if (quantity < 1) {
      return this.removeFromCart(itemId);
    }

    this.isLoading.set(true);

    return from(this.localCartService.updateItemQuantity(this.cartId(), itemId, quantity)).pipe(
      tap(() => {
        this.isLoading.set(false);
        this.loadCart(); // Reload cart to get updated data
        this.toastr.success('Cart updated successfully', 'Cart Updated');
      }),
      map(() => void 0),
      catchError(error => {
        this.isLoading.set(false);
        const errorMessage = error.message || 'Failed to update cart';
        this.toastr.error(errorMessage, 'Cart Error');
        return throwError(() => error);
      })
    );
  }

  removeFromCart(itemId: number): Observable<void> {
    if (!this.cartId()) {
      return throwError(() => new Error('No cart available'));
    }

    this.isLoading.set(true);

    try {
      this.localCartService.removeItem(this.cartId(), itemId);
      this.isLoading.set(false);
      this.loadCart(); // Reload cart to get updated data
      this.toastr.success('Item removed from cart', 'Cart Updated');
      return of(void 0);
    } catch (error: any) {
      this.isLoading.set(false);
      const errorMessage = error.message || 'Failed to remove item from cart';
      this.toastr.error(errorMessage, 'Cart Error');
      return throwError(() => error);
    }
  }

  clearCart(): Observable<void> {
    if (!this.cartId()) {
      return throwError(() => new Error('No cart available'));
    }

    this.isLoading.set(true);

    try {
      this.localCartService.clearCart(this.cartId());
      this.isLoading.set(false);
      this.cartItems.set([]);
      this.toastr.success('Cart cleared successfully', 'Cart Updated');
      return of(void 0);
    } catch (error: any) {
      this.isLoading.set(false);
      const errorMessage = error.message || 'Failed to clear cart';
      this.toastr.error(errorMessage, 'Cart Error');
      return throwError(() => error);
    }
  }

  getCartTotal(): Observable<{ itemCount: number; total: number }> {
    if (!this.cartId()) {
      return of({ itemCount: 0, total: 0 });
    }

    const total = this.localCartService.getCartTotal(this.cartId());
    return of(total);
  }

  private clearCartData(): void {
    this.cartItems.set([]);
    this.cartId.set(null);
  }

  // Method to refresh cart data
  refreshCart(): void {
    this.loadCart();
  }

  // Get current cart ID
  getCurrentCartId(): number | null {
    return this.cartId();
  }
}
