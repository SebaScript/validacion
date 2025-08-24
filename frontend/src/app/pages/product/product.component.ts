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

  readonly sizes: string[] = ['XS', 'S', 'M', 'L', 'XL'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
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
    if (!prod || !prod.carouselUrl || prod.carouselUrl.length <= 1) return;

    const current = this.currentImageIndex();
    const total = prod.carouselUrl.length;

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
}
