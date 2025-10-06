import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../shared/services/product.service';
import { CartService } from '../../shared/services/cart.service';
import { Product } from '../../shared/interfaces/product.interface';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductDetailComponent implements OnInit {
  currentImageIndex: WritableSignal<number> = signal(0);
  product: WritableSignal<Product | null> = signal(null);
  loading: WritableSignal<boolean> = signal(true);
  error: WritableSignal<string | null> = signal(null);
  selectedSize = 'M';
  isModalOpen: WritableSignal<boolean> = signal(false);
  modalTitle: WritableSignal<string> = signal('');
  modalBody: WritableSignal<string> = signal('');

  readonly sizes: string[] = ['XS', 'S', 'M', 'L', 'XL'];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly productService: ProductService,
    private readonly cartService: CartService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      const productId = paramMap.get('id');
      if (!productId) {
        this.error.set('Product not found');
        this.loading.set(false);
        return;
      }

      this.loading.set(true);
      this.productService.getProductById(+productId).subscribe({
        next: (product) => {
          this.product.set(product);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading product', err);
          this.error.set('Failed to load product details. Please try again later.');
          this.loading.set(false);
        }
      });
    });
  }

  getCurrentImageUrl(): string {
    const prod = this.product();
    if (!prod) return '';

    if (prod.carouselUrl && prod.carouselUrl.length > 0) {
      return prod.carouselUrl[this.currentImageIndex()] || prod.imageUrl || '';
    }

    return prod.imageUrl || '';
  }

  changeImage(direction: 'prev' | 'next') {
    const prod = this.product();
    const total = prod?.carouselUrl?.length ?? 0;

    if (total <= 1) return;

    const current = this.currentImageIndex();

    if (direction === 'prev') {
      this.currentImageIndex.set((current + total - 1) % total);
    } else {
      this.currentImageIndex.set((current + 1) % total);
    }
  }

  addToCart() {
    const prod = this.product();
    if (!prod) return;

    this.cartService.addToCart(prod, 1).subscribe({
      next: () => {
        console.log('Product added to cart');
        // You could show a toast notification here
      },
      error: (err) => {
        console.error('Error adding product to cart', err);
      }
    });
  }

  openModal(topic: 'size' | 'shipping') {
    if (topic === 'size') {
      this.modalTitle.set('Size Guide');
      this.modalBody.set(
        'Find your perfect fit. Tees are a regular fit. If you are between sizes, size up for a relaxed look. Approx measurements: XS (Chest 46-48 cm), S (49-51 cm), M (52-54 cm), L (55-57 cm), XL (58-60 cm). Measure a favorite tee flat across the chest and compare.'
      );
    } else if (topic === 'shipping') {
      this.modalTitle.set('Shipping & Returns');
      this.modalBody.set(
        'Orders are processed within 1–2 business days. Standard delivery: 3–7 business days. Express options available at checkout. Free returns within 30 days on unworn items with original tags. International shipping times vary by destination.'
      );
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }
}
