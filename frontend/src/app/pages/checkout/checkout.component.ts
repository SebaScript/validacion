import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../shared/services/cart.service';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  selectedMethod: 'card' | 'paypal' | 'google' = 'card';
  isProcessing = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly location: Location,
    private readonly router: Router,
    private readonly toastr: ToastrService,
    public cartService: CartService
  ) {
    this.checkoutForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]],
      cvc: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      cardholderName: ['', [Validators.required, Validators.minLength(2)]],
      country: ['US', Validators.required],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]]
    });
  }

  ngOnInit(): void {
    // Check if cart is empty and redirect if needed
    if (this.cartService.totalItems() === 0) {
      this.toastr.warning('Your cart is empty', 'Cannot proceed to checkout');
      this.router.navigate(['/']);
    }
  }

  goBack(): void {
    this.location.back();
  }

  selectMethod(method: 'card' | 'paypal' | 'google'): void {
    this.selectedMethod = method;

    // Clear form validation for non-card methods
    if (method !== 'card') {
      this.checkoutForm.clearValidators();
      this.checkoutForm.updateValueAndValidity();
    } else {
      this.setCardValidators();
    }
  }

  private setCardValidators(): void {
    this.checkoutForm.get('email')?.setValidators([Validators.required, Validators.email]);
    this.checkoutForm.get('cardNumber')?.setValidators([Validators.required, Validators.pattern(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/)]);
    this.checkoutForm.get('expiryDate')?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]);
    this.checkoutForm.get('cvc')?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
    this.checkoutForm.get('cardholderName')?.setValidators([Validators.required, Validators.minLength(2)]);
    this.checkoutForm.get('address')?.setValidators([Validators.required, Validators.minLength(5)]);
    this.checkoutForm.get('city')?.setValidators([Validators.required, Validators.minLength(2)]);
    this.checkoutForm.get('postalCode')?.setValidators([Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]);

    Object.keys(this.checkoutForm.controls).forEach(key => {
      this.checkoutForm.get(key)?.updateValueAndValidity();
    });
  }

  formatCardNumber(event: Event): void {
    const target = event.target as HTMLInputElement;
    let value = target.value.replace(/\D/g, ''); // Remove non-digits

    // Add spaces every 4 digits
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');

    // Limit to 19 characters (16 digits + 3 spaces)
    if (value.length > 19) {
      value = value.substring(0, 19);
    }

    target.value = value;
    this.checkoutForm.get('cardNumber')?.setValue(value, { emitEvent: false });
  }

  formatExpiryDate(event: Event): void {
    const target = event.target as HTMLInputElement;
    let value = target.value.replace(/\D/g, ''); // Remove non-digits

    // Add slash after MM
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }

    target.value = value;
    this.checkoutForm.get('expiryDate')?.setValue(value, { emitEvent: false });
  }

  async processPayment(): Promise<void> {
    if (this.selectedMethod === 'card' && this.checkoutForm.invalid) {
      this.markFormGroupTouched();
      this.toastr.error('Please fill all required fields correctly', 'Form Invalid');
      return;
    }

    this.isProcessing = true;

    try {
      // Simulate payment processing
      await this.simulatePaymentProcessing();

      // Clear cart after successful payment
      await this.cartService.clearCart().toPromise();

      // Show success message
      this.toastr.success('Payment processed successfully!', 'Order Complete');

      // Redirect to a success page or home
      this.router.navigate(['/'], { queryParams: { orderSuccess: 'true' } });

    } catch (error) {
      console.error('Payment processing failed:', error);
      this.toastr.error('Payment processing failed. Please try again.', 'Payment Error');
    } finally {
      this.isProcessing = false;
    }
  }

  private async simulatePaymentProcessing(): Promise<void> {
    // Simulate API call delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000); // 2 second delay to simulate processing
    });
  }

  simulatePayPal(): void {
    this.toastr.info('Redirecting to PayPal...', 'PayPal Payment');
    // Simulate PayPal redirect
    setTimeout(() => {
      this.processPayment();
    }, 1000);
  }

  simulateGooglePay(): void {
    this.toastr.info('Processing Google Pay...', 'Google Pay');
    // Simulate Google Pay processing
    setTimeout(() => {
      this.processPayment();
    }, 1000);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.checkoutForm.controls).forEach(key => {
      const control = this.checkoutForm.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }
}
