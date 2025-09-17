import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  @Input() isOpen = false;
  @Output() cartClosed = new EventEmitter<void>();

  constructor(
    public cartService: CartService,
    private readonly router: Router,
    private readonly toastr: ToastrService
  ) {}

  closeCart(): void {
    this.cartClosed.emit();
  }

  updateQuantity(itemId: number, quantity: number): void {
    this.cartService.updateQuantity(itemId, quantity).subscribe({
      next: () => {
        // Success handled by service
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
      }
    });
  }

  removeItem(itemId: number): void {
    this.cartService.removeFromCart(itemId).subscribe({
      next: () => {
        // Success handled by service
      },
      error: (error) => {
        console.error('Error removing item:', error);
      }
    });
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart().subscribe({
        next: () => {
          // Success handled by service
        },
        error: (error) => {
          console.error('Error clearing cart:', error);
        }
      });
    }
  }

  proceedToCheckout(): void {
    // For now, just show a message that checkout is not implemented
    this.toastr.info('Checkout functionality will be implemented soon!', 'Coming Soon');

    // In the future, you could navigate to a checkout page:
    // this.router.navigate(['/checkout']);

    // Or close the cart and show checkout modal:
    // this.closeCart();
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';

    // Create a placeholder div
    const placeholder = document.createElement('div');
    placeholder.style.cssText = `
      width: 100%;
      height: 100%;
      background: rgba(255, 213, 0, 0.1);
      border: 1px solid rgba(255, 213, 0, 0.2);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 213, 0, 0.6);
      font-size: 2rem;
    `;
    placeholder.textContent = '📷';

    // Replace the image with the placeholder
    img.parentElement?.appendChild(placeholder);
  }
}
