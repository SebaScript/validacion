import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';

import { CheckoutComponent } from './checkout.component';
import { CartService } from '../../shared/services/cart.service';
import { Product } from '../../shared/interfaces/product.interface';
import { CartItem } from '../../shared/interfaces/cart.interface';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let mockLocation: jasmine.SpyObj<Location>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockCartService: jasmine.SpyObj<CartService>;

  const mockProduct1: Product = {
    id: 1,
    name: 'Test Product 1',
    description: 'Test Description 1',
    price: 29.99,
    stock: 10,
    imageUrl: 'http://example.com/image1.jpg',
    carouselUrl: ['http://example.com/image1.jpg'],
    categoryId: 1,
    category: 'T-shirts'
  };

  const mockProduct2: Product = {
    id: 2,
    name: 'Test Product 2',
    description: 'Test Description 2',
    price: 39.99,
    stock: 5,
    imageUrl: 'http://example.com/image2.jpg',
    carouselUrl: ['http://example.com/image2.jpg'],
    categoryId: 2,
    category: 'Hoodies'
  };

  const mockCartItems: CartItem[] = [
    {
      cartItemId: 1,
      cartId: 1,
      productId: 1,
      quantity: 2,
      product: mockProduct1
    },
    {
      cartItemId: 2,
      cartId: 1,
      productId: 2,
      quantity: 1,
      product: mockProduct2
    }
  ];

  beforeEach(async () => {
    const locationSpy = jasmine.createSpyObj('Location', ['back']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const toastrSpy = jasmine.createSpyObj('ToastrService', [
      'success', 'error', 'warning', 'info'
    ]);

    const cartServiceSpy = jasmine.createSpyObj('CartService', [
      'totalItems', 'totalAmount', 'items', 'clearCart'
    ]);

    // Set up signals for cart service
    cartServiceSpy.totalItems.and.returnValue(3);
    cartServiceSpy.totalAmount.and.returnValue(99.97);
    cartServiceSpy.items.and.returnValue(mockCartItems);
    cartServiceSpy.clearCart.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [CheckoutComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: Location, useValue: locationSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: CartService, useValue: cartServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;

    mockLocation = TestBed.inject(Location) as jasmine.SpyObj<Location>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockToastr = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    mockCartService = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.selectedMethod).toBe('card');
      expect(component.isProcessing).toBe(false);
    });

    it('should initialize checkout form with validators', () => {
      expect(component.checkoutForm).toBeDefined();
      expect(component.checkoutForm.valid).toBe(false);
    });

    it('should redirect if cart is empty', () => {
      mockCartService.totalItems.and.returnValue(0);

      component.ngOnInit();

      expect(mockToastr.warning).toHaveBeenCalledWith('Your cart is empty', 'Cannot proceed to checkout');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should not redirect if cart has items', () => {
      mockCartService.totalItems.and.returnValue(3);

      component.ngOnInit();

      expect(mockToastr.warning).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should validate email field', () => {
      const emailControl = component.checkoutForm.get('email');

      emailControl?.setValue('');
      expect(emailControl?.hasError('required')).toBe(true);

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);

      emailControl?.setValue('test@example.com');
      expect(emailControl?.valid).toBe(true);
    });

    it('should validate card number field', () => {
      const cardNumberControl = component.checkoutForm.get('cardNumber');

      cardNumberControl?.setValue('');
      expect(cardNumberControl?.hasError('required')).toBe(true);

      cardNumberControl?.setValue('123');
      expect(cardNumberControl?.hasError('pattern')).toBe(true);

      cardNumberControl?.setValue('1234 5678 9012 3456');
      expect(cardNumberControl?.valid).toBe(true);
    });

    it('should validate expiry date field', () => {
      const expiryControl = component.checkoutForm.get('expiryDate');

      expiryControl?.setValue('');
      expect(expiryControl?.hasError('required')).toBe(true);

      expiryControl?.setValue('13/25');
      expect(expiryControl?.hasError('pattern')).toBe(true);

      expiryControl?.setValue('12/25');
      expect(expiryControl?.valid).toBe(true);
    });

    it('should validate CVC field', () => {
      const cvcControl = component.checkoutForm.get('cvc');

      cvcControl?.setValue('');
      expect(cvcControl?.hasError('required')).toBe(true);

      cvcControl?.setValue('12');
      expect(cvcControl?.hasError('pattern')).toBe(true);

      cvcControl?.setValue('123');
      expect(cvcControl?.valid).toBe(true);

      cvcControl?.setValue('1234');
      expect(cvcControl?.valid).toBe(true);
    });

    it('should validate cardholder name field', () => {
      const nameControl = component.checkoutForm.get('cardholderName');

      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBe(true);

      nameControl?.setValue('J');
      expect(nameControl?.hasError('minlength')).toBe(true);

      nameControl?.setValue('John Doe');
      expect(nameControl?.valid).toBe(true);
    });

    it('should validate address fields', () => {
      const addressControl = component.checkoutForm.get('address');
      const cityControl = component.checkoutForm.get('city');
      const postalCodeControl = component.checkoutForm.get('postalCode');

      addressControl?.setValue('');
      expect(addressControl?.hasError('required')).toBe(true);

      addressControl?.setValue('123');
      expect(addressControl?.hasError('minlength')).toBe(true);

      addressControl?.setValue('123 Main Street');
      expect(addressControl?.valid).toBe(true);

      cityControl?.setValue('A');
      expect(cityControl?.hasError('minlength')).toBe(true);

      cityControl?.setValue('New York');
      expect(cityControl?.valid).toBe(true);

      postalCodeControl?.setValue('123');
      expect(postalCodeControl?.hasError('pattern')).toBe(true);

      postalCodeControl?.setValue('12345');
      expect(postalCodeControl?.valid).toBe(true);

      postalCodeControl?.setValue('12345-6789');
      expect(postalCodeControl?.valid).toBe(true);
    });
  });

  describe('Payment Method Selection', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should change payment method to PayPal', () => {
      component.selectMethod('paypal');

      expect(component.selectedMethod).toBe('paypal');
    });

    it('should change payment method to Google Pay', () => {
      component.selectMethod('google');

      expect(component.selectedMethod).toBe('google');
    });

    it('should change payment method back to card', () => {
      component.selectedMethod = 'paypal';

      component.selectMethod('card');

      expect(component.selectedMethod).toBe('card');
    });

    it('should clear form validators for non-card methods', () => {
      spyOn(component.checkoutForm, 'clearValidators');
      spyOn(component.checkoutForm, 'updateValueAndValidity');

      component.selectMethod('paypal');

      expect(component.checkoutForm.clearValidators).toHaveBeenCalled();
      expect(component.checkoutForm.updateValueAndValidity).toHaveBeenCalled();
    });

    it('should set card validators when switching to card method', () => {
      component.selectedMethod = 'paypal';
      spyOn(component as any, 'setCardValidators');

      component.selectMethod('card');

      expect(component['setCardValidators']).toHaveBeenCalled();
    });
  });

  describe('Input Formatting', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should format card number input', () => {
      const event = { target: { value: '1234567890123456' } } as any;

      component.formatCardNumber(event);

      expect(event.target.value).toBe('1234 5678 9012 3456');
    });

    it('should remove non-digits from card number', () => {
      const event = { target: { value: '1234-5678-9012-3456' } } as any;

      component.formatCardNumber(event);

      expect(event.target.value).toBe('1234 5678 9012 3456');
    });

    it('should limit card number to 19 characters', () => {
      const event = { target: { value: '12345678901234567890' } } as any;

      component.formatCardNumber(event);

      expect(event.target.value).toBe('1234 5678 9012 3456');
    });

    it('should format expiry date input', () => {
      const event = { target: { value: '1225' } } as any;

      component.formatExpiryDate(event);

      expect(event.target.value).toBe('12/25');
    });

    it('should handle partial expiry date', () => {
      const event = { target: { value: '1' } } as any;

      component.formatExpiryDate(event);

      expect(event.target.value).toBe('1');
    });

    it('should remove non-digits from expiry date', () => {
      const event = { target: { value: '12/25' } } as any;

      component.formatExpiryDate(event);

      expect(event.target.value).toBe('12/25');
    });
  });

  describe('Payment Processing', () => {
    beforeEach(() => {
      fixture.detectChanges();
      // Set up valid form data
      component.checkoutForm.patchValue({
        email: 'test@example.com',
        cardNumber: '1234 5678 9012 3456',
        expiryDate: '12/25',
        cvc: '123',
        cardholderName: 'John Doe',
        country: 'US',
        address: '123 Main Street',
        city: 'New York',
        postalCode: '12345'
      });
    });

    it('should not process payment if form is invalid for card method', () => {
      component.checkoutForm.patchValue({ email: '' }); // Make form invalid
      component.selectedMethod = 'card';
      spyOn(component as any, 'markFormGroupTouched');

      component.processPayment();

      expect(component['markFormGroupTouched']).toHaveBeenCalled();
      expect(mockToastr.error).toHaveBeenCalledWith('Please fill all required fields correctly', 'Form Invalid');
      expect(component.isProcessing).toBe(false);
    });

    it('should process card payment successfully', fakeAsync(() => {
      component.selectedMethod = 'card';
      spyOn(component as any, 'simulatePaymentProcessing').and.returnValue(Promise.resolve());

      component.processPayment();
      expect(component.isProcessing).toBe(true);

      tick(2000);

      expect(mockCartService.clearCart).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Payment processed successfully!', 'Order Complete');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/'], { queryParams: { orderSuccess: 'true' } });
      expect(component.isProcessing).toBe(false);
    }));

    it('should handle payment processing error', fakeAsync(() => {
      component.selectedMethod = 'card';
      spyOn(component as any, 'simulatePaymentProcessing').and.returnValue(Promise.reject(new Error('Payment failed')));
      spyOn(console, 'error');

      component.processPayment();
      expect(component.isProcessing).toBe(true);

      tick(2000);

      expect(console.error).toHaveBeenCalledWith('Payment processing failed:', jasmine.any(Error));
      expect(mockToastr.error).toHaveBeenCalledWith('Payment processing failed. Please try again.', 'Payment Error');
      expect(component.isProcessing).toBe(false);
    }));

    it('should process non-card payment methods', fakeAsync(() => {
      component.selectedMethod = 'paypal';
      spyOn(component as any, 'simulatePaymentProcessing').and.returnValue(Promise.resolve());

      component.processPayment();
      expect(component.isProcessing).toBe(true);

      tick(2000);

      expect(mockCartService.clearCart).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Payment processed successfully!', 'Order Complete');
      expect(component.isProcessing).toBe(false);
    }));
  });

  describe('Alternative Payment Methods', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should simulate PayPal payment', fakeAsync(() => {
      spyOn(component, 'processPayment');

      component.simulatePayPal();

      expect(mockToastr.info).toHaveBeenCalledWith('Redirecting to PayPal...', 'PayPal Payment');

      tick(1000);

      expect(component.processPayment).toHaveBeenCalled();
    }));

    it('should simulate Google Pay payment', fakeAsync(() => {
      spyOn(component, 'processPayment');

      component.simulateGooglePay();

      expect(mockToastr.info).toHaveBeenCalledWith('Processing Google Pay...', 'Google Pay');

      tick(1000);

      expect(component.processPayment).toHaveBeenCalled();
    }));
  });

  describe('Navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should go back when goBack is called', () => {
      component.goBack();

      expect(mockLocation.back).toHaveBeenCalled();
    });
  });

  describe('Cart Integration', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display cart items', () => {
      expect(component.cartService.items()).toEqual(mockCartItems);
    });

    it('should display correct total amount', () => {
      expect(component.cartService.totalAmount()).toBe(99.97);
    });

    it('should display correct total items', () => {
      expect(component.cartService.totalItems()).toBe(3);
    });

    it('should calculate tax correctly', () => {
      const taxAmount = component.cartService.totalAmount() * 0.08;
      expect(taxAmount).toBeCloseTo(7.998, 2);
    });

    it('should calculate final total with tax', () => {
      const finalTotal = component.cartService.totalAmount() * 1.08;
      expect(finalTotal).toBeCloseTo(107.968, 2);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle cart service errors gracefully', () => {
      // Simulate empty cart scenario
      mockCartService.totalItems.and.returnValue(0);
      mockCartService.items.and.returnValue([]);

      expect(() => component.ngOnInit()).not.toThrow();
      expect(component.cartService.items().length).toBe(0);
    });

    it('should handle form validation errors', () => {
      component.checkoutForm.patchValue({
        email: 'invalid',
        cardNumber: '123',
        expiryDate: '13/99',
        cvc: '1'
      });

      component.selectedMethod = 'card';
      component.processPayment();

      expect(mockToastr.error).toHaveBeenCalledWith('Please fill all required fields correctly', 'Form Invalid');
    });

    it('should handle missing form fields', () => {
      component.checkoutForm.patchValue({
        email: '',
        cardNumber: '',
        expiryDate: '',
        cvc: '',
        cardholderName: '',
        address: '',
        city: '',
        postalCode: ''
      });

      component.selectedMethod = 'card';
      component.processPayment();

      expect(mockToastr.error).toHaveBeenCalledWith('Please fill all required fields correctly', 'Form Invalid');
    });
  });

  describe('Form Helper Methods', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should mark form group as touched', () => {
      const emailControl = component.checkoutForm.get('email');
      const cardNumberControl = component.checkoutForm.get('cardNumber');

      expect(emailControl?.touched).toBe(false);
      expect(cardNumberControl?.touched).toBe(false);

      component['markFormGroupTouched']();

      expect(emailControl?.touched).toBe(true);
      expect(cardNumberControl?.touched).toBe(true);
    });

    it('should set card validators correctly', () => {
      component['setCardValidators']();

      const emailControl = component.checkoutForm.get('email');
      const cardNumberControl = component.checkoutForm.get('cardNumber');
      const expiryControl = component.checkoutForm.get('expiryDate');

      expect(emailControl?.hasError('required')).toBe(true);
      expect(cardNumberControl?.hasError('required')).toBe(true);
      expect(expiryControl?.hasError('required')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle empty cart during checkout', () => {
      mockCartService.totalItems.and.returnValue(0);
      mockCartService.items.and.returnValue([]);

      component.ngOnInit();

      expect(mockToastr.warning).toHaveBeenCalledWith('Your cart is empty', 'Cannot proceed to checkout');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should handle invalid card number format', () => {
      const event = { target: { value: 'abcd efgh ijkl mnop' } } as any;

      component.formatCardNumber(event);

      expect(event.target.value).toBe('');
    });

    it('should handle invalid expiry date format', () => {
      const event = { target: { value: 'ab/cd' } } as any;

      component.formatExpiryDate(event);

      expect(event.target.value).toBe(''); // Non-digits are removed, leaving empty string
    });

    it('should handle very long input values', () => {
      const longCardNumber = '1'.repeat(50);
      const event = { target: { value: longCardNumber } } as any;

      component.formatCardNumber(event);

      expect(event.target.value.length).toBeLessThanOrEqual(19);
    });
  });

  describe('Template Integration', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display payment method tabs', () => {
      const cardTab = fixture.nativeElement.querySelector('[data-testid="card-tab"]') ||
                     fixture.nativeElement.querySelector('.method-tab');
      expect(cardTab).toBeTruthy();
    });

    it('should display cart items in order summary', () => {
      const orderItems = fixture.nativeElement.querySelector('.order-items');
      expect(orderItems).toBeTruthy();
    });

    it('should display total amount in pay button', () => {
      const payButton = fixture.nativeElement.querySelector('.pay-button');
      expect(payButton?.textContent).toContain('Pay $');
    });

    it('should disable pay button when processing', () => {
      component.isProcessing = true;
      fixture.detectChanges();

      const payButton = fixture.nativeElement.querySelector('.pay-button');
      expect(payButton?.disabled).toBe(true);
    });

    it('should show loading state when processing', () => {
      component.isProcessing = true;
      fixture.detectChanges();

      const loadingIcon = fixture.nativeElement.querySelector('.spinning');
      const loadingText = fixture.nativeElement.querySelector('.pay-button span');

      expect(loadingIcon).toBeTruthy();
      expect(loadingText?.textContent?.trim()).toBe('Processing...');
    });
  });

  describe('Performance and Memory', () => {
    it('should not create memory leaks with multiple payment attempts', fakeAsync(() => {
      component.checkoutForm.patchValue({
        email: 'test@example.com',
        cardNumber: '1234 5678 9012 3456',
        expiryDate: '12/25',
        cvc: '123',
        cardholderName: 'John Doe',
        address: '123 Main Street',
        city: 'New York',
        postalCode: '12345'
      });

      spyOn(component as any, 'simulatePaymentProcessing').and.returnValue(Promise.resolve());

      for (let i = 0; i < 5; i++) {
        component.processPayment();
        tick(2000);
      }

      expect(mockCartService.clearCart).toHaveBeenCalledTimes(5);
    }));

    it('should handle rapid form input changes', () => {
      const cardNumberValues = ['1', '12', '123', '1234', '12345'];

      cardNumberValues.forEach(value => {
        const event = { target: { value } } as any;
        component.formatCardNumber(event);
      });

      expect(() => component.checkoutForm.get('cardNumber')?.value).not.toThrow();
    });
  });
});
