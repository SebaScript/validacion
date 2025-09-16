import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { CartComponent } from './cart.component';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../interfaces/cart.interface';
import { Product } from '../../interfaces/product.interface';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let mockCartService: jasmine.SpyObj<CartService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockToastr: jasmine.SpyObj<ToastrService>;

  const mockProduct1: Product = {
    id: 1,
    name: 'Test Product 1',
    description: 'Test Description 1',
    price: 29.99,
    stock: 10,
    imageUrl: 'test-image-1.jpg',
    carouselUrl: ['test-image-1.jpg', 'test-image-2.jpg'],
    categoryId: 1,
    category: 'Test Category'
  };

  const mockProduct2: Product = {
    id: 2,
    name: 'Test Product 2',
    description: 'Test Description 2',
    price: 39.99,
    stock: 5,
    imageUrl: 'test-image-2.jpg',
    categoryId: 1,
    category: 'Test Category'
  };

  const mockProductNoImage: Product = {
    id: 3,
    name: 'Product No Image',
    description: 'No image product',
    price: 19.99,
    stock: 3,
    categoryId: 2,
    category: 'Another Category'
  };

  const mockCartItem1: CartItem = {
    cartItemId: 1,
    cartId: 1,
    productId: 1,
    quantity: 2,
    product: mockProduct1
  };

  const mockCartItem2: CartItem = {
    cartItemId: 2,
    cartId: 1,
    productId: 2,
    quantity: 1,
    product: mockProduct2
  };

  const mockCartItemNoImage: CartItem = {
    cartItemId: 3,
    cartId: 1,
    productId: 3,
    quantity: 1,
    product: mockProductNoImage
  };

  beforeEach(async () => {
    // Create spy objects
    mockCartService = jasmine.createSpyObj('CartService', [
      'updateQuantity',
      'removeFromCart',
      'clearCart',
      'items',
      'loading',
      'totalItems',
      'totalAmount'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['info', 'success', 'error']);

    // Setup default return values for signals
    mockCartService.items.and.returnValue([mockCartItem1, mockCartItem2]);
    mockCartService.loading.and.returnValue(false);
    mockCartService.totalItems.and.returnValue(3);
    mockCartService.totalAmount.and.returnValue(99.97);

    await TestBed.configureTestingModule({
      imports: [CartComponent, CommonModule],
      providers: [
        { provide: CartService, useValue: mockCartService },
        { provide: Router, useValue: mockRouter },
        { provide: ToastrService, useValue: mockToastr }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.isOpen).toBe(false);
      expect(component.cartService).toBeDefined();
      expect((component as any).router).toBeDefined();
      expect((component as any).toastr).toBeDefined();
    });

    it('should have correct constructor dependencies', () => {
      expect(component).toBeTruthy();
      expect((component as any).cartService).toBeDefined();
      expect((component as any).router).toBeDefined();
      expect((component as any).toastr).toBeDefined();
    });
  });

  describe('Input/Output Properties', () => {
    it('should accept isOpen input', () => {
      component.isOpen = true;
      expect(component.isOpen).toBe(true);
    });

    it('should emit cartClosed event', () => {
      spyOn(component.cartClosed, 'emit');
      
      component.closeCart();
      
      expect(component.cartClosed.emit).toHaveBeenCalled();
    });

    it('should emit cartClosed event when closeCart is called multiple times', () => {
      spyOn(component.cartClosed, 'emit');
      
      component.closeCart();
      component.closeCart();
      component.closeCart();
      
      expect(component.cartClosed.emit).toHaveBeenCalledTimes(3);
    });
  });

  describe('updateQuantity - Quantity Management', () => {
    it('should update quantity successfully', () => {
      mockCartService.updateQuantity.and.returnValue(of(void 0));
      spyOn(console, 'error');

      component.updateQuantity(1, 3);

      expect(mockCartService.updateQuantity).toHaveBeenCalledWith(1, 3);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should handle updateQuantity service error', () => {
      const error = new Error('Update failed');
      mockCartService.updateQuantity.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.updateQuantity(1, 3);

      expect(mockCartService.updateQuantity).toHaveBeenCalledWith(1, 3);
      expect(console.error).toHaveBeenCalledWith('Error updating quantity:', error);
    });

    it('should update quantity for different items', () => {
      mockCartService.updateQuantity.and.returnValue(of(void 0));

      component.updateQuantity(1, 5);
      component.updateQuantity(2, 1);

      expect(mockCartService.updateQuantity).toHaveBeenCalledWith(1, 5);
      expect(mockCartService.updateQuantity).toHaveBeenCalledWith(2, 1);
      expect(mockCartService.updateQuantity).toHaveBeenCalledTimes(2);
    });

    it('should handle quantity update to zero', () => {
      mockCartService.updateQuantity.and.returnValue(of(void 0));

      component.updateQuantity(1, 0);

      expect(mockCartService.updateQuantity).toHaveBeenCalledWith(1, 0);
    });

    it('should handle negative quantity', () => {
      mockCartService.updateQuantity.and.returnValue(of(void 0));

      component.updateQuantity(1, -1);

      expect(mockCartService.updateQuantity).toHaveBeenCalledWith(1, -1);
    });

    it('should handle large quantity values', () => {
      mockCartService.updateQuantity.and.returnValue(of(void 0));

      component.updateQuantity(1, 999);

      expect(mockCartService.updateQuantity).toHaveBeenCalledWith(1, 999);
    });
  });

  describe('removeItem - Item Removal', () => {
    it('should remove item successfully', () => {
      mockCartService.removeFromCart.and.returnValue(of(void 0));
      spyOn(console, 'error');

      component.removeItem(1);

      expect(mockCartService.removeFromCart).toHaveBeenCalledWith(1);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should handle removeItem service error', () => {
      const error = new Error('Remove failed');
      mockCartService.removeFromCart.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.removeItem(1);

      expect(mockCartService.removeFromCart).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalledWith('Error removing item:', error);
    });

    it('should remove different items', () => {
      mockCartService.removeFromCart.and.returnValue(of(void 0));

      component.removeItem(1);
      component.removeItem(2);
      component.removeItem(3);

      expect(mockCartService.removeFromCart).toHaveBeenCalledWith(1);
      expect(mockCartService.removeFromCart).toHaveBeenCalledWith(2);
      expect(mockCartService.removeFromCart).toHaveBeenCalledWith(3);
      expect(mockCartService.removeFromCart).toHaveBeenCalledTimes(3);
    });

    it('should handle removing non-existent item', () => {
      const error = new Error('Item not found');
      mockCartService.removeFromCart.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.removeItem(999);

      expect(mockCartService.removeFromCart).toHaveBeenCalledWith(999);
      expect(console.error).toHaveBeenCalledWith('Error removing item:', error);
    });
  });

  describe('clearCart - Cart Clearing', () => {
    beforeEach(() => {
      // Mock window.confirm
      spyOn(window, 'confirm').and.returnValue(true);
    });

    it('should clear cart when user confirms', () => {
      mockCartService.clearCart.and.returnValue(of(void 0));
      spyOn(console, 'error');

      component.clearCart();

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to clear your cart?');
      expect(mockCartService.clearCart).toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should not clear cart when user cancels', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);

      component.clearCart();

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to clear your cart?');
      expect(mockCartService.clearCart).not.toHaveBeenCalled();
    });

    it('should handle clearCart service error', () => {
      const error = new Error('Clear failed');
      mockCartService.clearCart.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.clearCart();

      expect(mockCartService.clearCart).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Error clearing cart:', error);
    });

    it('should handle multiple clear cart attempts', () => {
      mockCartService.clearCart.and.returnValue(of(void 0));

      component.clearCart();
      component.clearCart();

      expect(window.confirm).toHaveBeenCalledTimes(2);
      expect(mockCartService.clearCart).toHaveBeenCalledTimes(2);
    });
  });

  describe('proceedToCheckout - Checkout Flow', () => {
    it('should show coming soon message', () => {
      component.proceedToCheckout();

      expect(mockToastr.info).toHaveBeenCalledWith(
        'Checkout functionality will be implemented soon!',
        'Coming Soon'
      );
    });

    it('should show coming soon message multiple times', () => {
      component.proceedToCheckout();
      component.proceedToCheckout();
      component.proceedToCheckout();

      expect(mockToastr.info).toHaveBeenCalledTimes(3);
      expect(mockToastr.info).toHaveBeenCalledWith(
        'Checkout functionality will be implemented soon!',
        'Coming Soon'
      );
    });

    it('should not navigate to checkout page', () => {
      component.proceedToCheckout();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should not close cart automatically', () => {
      spyOn(component.cartClosed, 'emit');
      
      component.proceedToCheckout();

      expect(component.cartClosed.emit).not.toHaveBeenCalled();
    });
  });

  describe('onImageError - Image Error Handling', () => {
    let mockImg: HTMLImageElement;
    let mockParentElement: HTMLElement;

    beforeEach(() => {
      mockImg = document.createElement('img');
      mockParentElement = document.createElement('div');
      mockParentElement.appendChild(mockImg);
      document.body.appendChild(mockParentElement);
    });

    afterEach(() => {
      document.body.removeChild(mockParentElement);
    });

    it('should hide image on error', () => {
      const event = { target: mockImg } as any;

      component.onImageError(event);

      expect(mockImg.style.display).toBe('none');
    });

    it('should create placeholder div on image error', () => {
      const event = { target: mockImg } as any;

      component.onImageError(event);

      const placeholder = mockParentElement.querySelector('div');
      expect(placeholder).toBeTruthy();
      expect(placeholder?.textContent).toBe('📷');
      expect(placeholder?.style.background).toContain('rgba(255, 213, 0, 0.1)');
      expect(placeholder?.style.border).toContain('rgba(255, 213, 0, 0.2)');
    });

    it('should handle multiple image errors', () => {
      const mockImg2 = document.createElement('img');
      mockParentElement.appendChild(mockImg2);
      
      const event1 = { target: mockImg } as any;
      const event2 = { target: mockImg2 } as any;

      component.onImageError(event1);
      component.onImageError(event2);

      expect(mockImg.style.display).toBe('none');
      expect(mockImg2.style.display).toBe('none');
      
      const placeholders = mockParentElement.querySelectorAll('div');
      expect(placeholders.length).toBe(2);
    });

    it('should handle image error with no parent element', () => {
      const orphanImg = document.createElement('img');
      const event = { target: orphanImg } as any;

      // Should not throw error
      expect(() => component.onImageError(event)).not.toThrow();
      expect(orphanImg.style.display).toBe('none');
    });

    it('should create placeholder with correct styling', () => {
      const event = { target: mockImg } as any;

      component.onImageError(event);

      const placeholder = mockParentElement.querySelector('div');
      expect(placeholder?.style.width).toBe('100%');
      expect(placeholder?.style.height).toBe('100%');
      expect(placeholder?.style.display).toBe('flex');
      expect(placeholder?.style.alignItems).toBe('center');
      expect(placeholder?.style.justifyContent).toBe('center');
      expect(placeholder?.style.color).toContain('rgba(255, 213, 0, 0.6)');
      expect(placeholder?.style.fontSize).toBe('2rem');
    });
  });

  describe('Component State Management', () => {
    it('should handle cart service loading state', () => {
      mockCartService.loading.and.returnValue(true);
      mockCartService.items.and.returnValue([]);

      fixture.detectChanges();

      expect(component.cartService.loading()).toBe(true);
    });

    it('should handle empty cart state', () => {
      mockCartService.loading.and.returnValue(false);
      mockCartService.items.and.returnValue([]);

      fixture.detectChanges();

      expect(component.cartService.items().length).toBe(0);
    });

    it('should handle cart with items', () => {
      mockCartService.loading.and.returnValue(false);
      mockCartService.items.and.returnValue([mockCartItem1, mockCartItem2]);

      fixture.detectChanges();

      expect(component.cartService.items().length).toBe(2);
    });

    it('should handle cart totals correctly', () => {
      mockCartService.totalItems.and.returnValue(3);
      mockCartService.totalAmount.and.returnValue(99.97);

      fixture.detectChanges();

      expect(component.cartService.totalItems()).toBe(3);
      expect(component.cartService.totalAmount()).toBe(99.97);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle updateQuantity with invalid itemId', () => {
      const error = new Error('Invalid item ID');
      mockCartService.updateQuantity.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.updateQuantity(-1, 1);

      expect(mockCartService.updateQuantity).toHaveBeenCalledWith(-1, 1);
      expect(console.error).toHaveBeenCalledWith('Error updating quantity:', error);
    });

    it('should handle removeItem with invalid itemId', () => {
      const error = new Error('Invalid item ID');
      mockCartService.removeFromCart.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.removeItem(0);

      expect(mockCartService.removeFromCart).toHaveBeenCalledWith(0);
      expect(console.error).toHaveBeenCalledWith('Error removing item:', error);
    });

    it('should handle clearCart with network error', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      const error = new Error('Network error');
      mockCartService.clearCart.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.clearCart();

      expect(console.error).toHaveBeenCalledWith('Error clearing cart:', error);
    });

    it('should handle image error with null target', () => {
      const event = { target: null } as any;

      expect(() => component.onImageError(event)).toThrow();
    });

    it('should handle image error with undefined target', () => {
      const event = { target: undefined } as any;

      expect(() => component.onImageError(event)).toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete cart interaction flow', () => {
      // Setup successful service calls
      mockCartService.updateQuantity.and.returnValue(of(void 0));
      mockCartService.removeFromCart.and.returnValue(of(void 0));
      mockCartService.clearCart.and.returnValue(of(void 0));
      spyOn(window, 'confirm').and.returnValue(true);

      // Update quantity
      component.updateQuantity(1, 3);
      expect(mockCartService.updateQuantity).toHaveBeenCalledWith(1, 3);

      // Remove item
      component.removeItem(2);
      expect(mockCartService.removeFromCart).toHaveBeenCalledWith(2);

      // Clear cart
      component.clearCart();
      expect(mockCartService.clearCart).toHaveBeenCalled();

      // Proceed to checkout
      component.proceedToCheckout();
      expect(mockToastr.info).toHaveBeenCalledWith(
        'Checkout functionality will be implemented soon!',
        'Coming Soon'
      );

      // Close cart
      spyOn(component.cartClosed, 'emit');
      component.closeCart();
      expect(component.cartClosed.emit).toHaveBeenCalled();
    });

    it('should handle error recovery flow', () => {
      // Start with errors
      const updateError = new Error('Update failed');
      const removeError = new Error('Remove failed');
      const clearError = new Error('Clear failed');
      
      mockCartService.updateQuantity.and.returnValue(throwError(() => updateError));
      mockCartService.removeFromCart.and.returnValue(throwError(() => removeError));
      mockCartService.clearCart.and.returnValue(throwError(() => clearError));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(console, 'error');

      component.updateQuantity(1, 3);
      component.removeItem(1);
      component.clearCart();

      expect(console.error).toHaveBeenCalledWith('Error updating quantity:', updateError);
      expect(console.error).toHaveBeenCalledWith('Error removing item:', removeError);
      expect(console.error).toHaveBeenCalledWith('Error clearing cart:', clearError);

      // Retry with success
      mockCartService.updateQuantity.and.returnValue(of(void 0));
      mockCartService.removeFromCart.and.returnValue(of(void 0));
      mockCartService.clearCart.and.returnValue(of(void 0));

      component.updateQuantity(1, 3);
      component.removeItem(1);
      component.clearCart();

      expect(mockCartService.updateQuantity).toHaveBeenCalledTimes(2);
      expect(mockCartService.removeFromCart).toHaveBeenCalledTimes(2);
      expect(mockCartService.clearCart).toHaveBeenCalledTimes(2);
    });
  });

  describe('Template Integration', () => {
    it('should render loading state correctly', () => {
      mockCartService.loading.and.returnValue(true);
      mockCartService.items.and.returnValue([]);

      fixture.detectChanges();

      const loadingElement = fixture.nativeElement.querySelector('.loading-spinner');
      expect(loadingElement).toBeTruthy();
      expect(loadingElement.textContent).toContain('Loading cart...');
    });

    it('should render empty cart state correctly', () => {
      mockCartService.loading.and.returnValue(false);
      mockCartService.items.and.returnValue([]);

      fixture.detectChanges();

      const emptyCartElement = fixture.nativeElement.querySelector('.empty-cart');
      expect(emptyCartElement).toBeTruthy();
      expect(emptyCartElement.textContent).toContain('Your cart is empty');
      expect(emptyCartElement.textContent).toContain('Add some products to get started!');
    });

    it('should render cart items correctly', () => {
      mockCartService.loading.and.returnValue(false);
      mockCartService.items.and.returnValue([mockCartItem1, mockCartItem2]);
      mockCartService.totalItems.and.returnValue(3);
      mockCartService.totalAmount.and.returnValue(99.97);

      fixture.detectChanges();

      const cartItems = fixture.nativeElement.querySelectorAll('.cart-item');
      expect(cartItems.length).toBe(2);

      const itemNames = fixture.nativeElement.querySelectorAll('.item-name');
      expect(itemNames[0].textContent).toContain('Test Product 1');
      expect(itemNames[1].textContent).toContain('Test Product 2');

      const itemPrices = fixture.nativeElement.querySelectorAll('.item-price');
      expect(itemPrices[0].textContent).toContain('29.99');
      expect(itemPrices[1].textContent).toContain('39.99');
    });

    it('should render cart summary correctly', () => {
      mockCartService.loading.and.returnValue(false);
      mockCartService.items.and.returnValue([mockCartItem1, mockCartItem2]);
      mockCartService.totalItems.and.returnValue(3);
      mockCartService.totalAmount.and.returnValue(99.97);

      fixture.detectChanges();

      const summaryElement = fixture.nativeElement.querySelector('.cart-summary');
      expect(summaryElement).toBeTruthy();
      expect(summaryElement.textContent).toContain('Items: 3');
      expect(summaryElement.textContent).toContain('Total: $99.97');
    });

    it('should render cart actions when items exist', () => {
      mockCartService.loading.and.returnValue(false);
      mockCartService.items.and.returnValue([mockCartItem1]);

      fixture.detectChanges();

      const clearBtn = fixture.nativeElement.querySelector('.clear-btn');
      const checkoutBtn = fixture.nativeElement.querySelector('.checkout-btn');

      expect(clearBtn).toBeTruthy();
      expect(checkoutBtn).toBeTruthy();
      expect(clearBtn.textContent).toContain('Clear Cart');
      expect(checkoutBtn.textContent).toContain('Checkout');
    });

    it('should not render cart actions when cart is empty', () => {
      mockCartService.loading.and.returnValue(false);
      mockCartService.items.and.returnValue([]);

      fixture.detectChanges();

      const cartFooter = fixture.nativeElement.querySelector('.cart-footer');
      expect(cartFooter).toBeFalsy();
    });

    it('should render quantity controls correctly', () => {
      mockCartService.loading.and.returnValue(false);
      mockCartService.items.and.returnValue([mockCartItem1]);

      fixture.detectChanges();

      const quantityControls = fixture.nativeElement.querySelector('.quantity-controls');
      expect(quantityControls).toBeTruthy();

      const quantityBtns = fixture.nativeElement.querySelectorAll('.quantity-btn');
      expect(quantityBtns.length).toBe(2); // Remove and Add buttons

      const quantitySpan = fixture.nativeElement.querySelector('.quantity');
      expect(quantitySpan.textContent).toContain('2'); // mockCartItem1.quantity
    });

    it('should render remove buttons correctly', () => {
      mockCartService.loading.and.returnValue(false);
      mockCartService.items.and.returnValue([mockCartItem1, mockCartItem2]);

      fixture.detectChanges();

      const removeBtns = fixture.nativeElement.querySelectorAll('.remove-btn');
      expect(removeBtns.length).toBe(2);
    });
  });

  describe('Accessibility and User Experience', () => {
    it('should have proper button titles for remove buttons', () => {
      mockCartService.loading.and.returnValue(false);
      mockCartService.items.and.returnValue([mockCartItem1]);

      fixture.detectChanges();

      const removeBtn = fixture.nativeElement.querySelector('.remove-btn');
      expect(removeBtn.getAttribute('title')).toBe('Remove item');
    });

    it('should disable quantity decrease button when quantity is 1', () => {
      const itemWithQuantity1 = { ...mockCartItem1, quantity: 1 };
      mockCartService.loading.and.returnValue(false);
      mockCartService.items.and.returnValue([itemWithQuantity1]);

      fixture.detectChanges();

      const quantityBtns = fixture.nativeElement.querySelectorAll('.quantity-btn');
      const decreaseBtn = quantityBtns[0]; // First button is decrease
      expect(decreaseBtn.hasAttribute('disabled')).toBe(true);
    });

    it('should disable quantity increase button when at stock limit', () => {
      const itemAtStockLimit = { ...mockCartItem1, quantity: 10, product: { ...mockProduct1, stock: 10 } };
      mockCartService.loading.and.returnValue(false);
      mockCartService.items.and.returnValue([itemAtStockLimit]);

      fixture.detectChanges();

      const quantityBtns = fixture.nativeElement.querySelectorAll('.quantity-btn');
      const increaseBtn = quantityBtns[1]; // Second button is increase
      expect(increaseBtn.hasAttribute('disabled')).toBe(true);
    });

    it('should render close button correctly', () => {
      fixture.detectChanges();

      const closeBtn = fixture.nativeElement.querySelector('.close-btn');
      expect(closeBtn).toBeTruthy();
    });

    it('should render cart header correctly', () => {
      fixture.detectChanges();

      const cartHeader = fixture.nativeElement.querySelector('.cart-header h3');
      expect(cartHeader.textContent).toContain('Shopping Cart');
    });
  });
});
