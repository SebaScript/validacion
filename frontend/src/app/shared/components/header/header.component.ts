import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CartComponent } from '../cart/cart.component';
import { User } from '../../interfaces/user.interface';
import { Product } from '../../interfaces/product.interface';

interface SearchProduct {
  id: number;
  name: string;
  imageUrl: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, CartComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() cartCount: number = 0; // Keeping for backward compatibility but using cartService instead
  query: string = '';
  results: SearchProduct[] = [];
  currentUser: User | null = null;
  isAuthenticated = false;
  isAdmin = false;
  isCartOpen = false;
  private allProducts: Product[] = [];

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly productService: ProductService,
    public cartService: CartService,
    private readonly toastr: ToastrService
  ) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
      this.isAdmin = user?.role === 'admin';
    });

    this.loadProducts();
  }

  private loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
      },
      error: (error) => {
        console.error('Error loading products for search:', error);
      }
    });
  }

  onSearch(): void {
    if (!this.query.trim()) {
      this.results = [];
      return;
    }

    const searchTerm = this.query.toLowerCase();
    this.results = this.allProducts
      .filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description!.toLowerCase().includes(searchTerm)
      )
      .slice(0, 5)
      .map(product => ({
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl || ''
      }));
  }

  goToProduct(id: number): void {
    this.router.navigate(['/product', id]);
    this.clearSearch();
  }

  clearSearch(): void {
    this.query = '';
    this.results = [];
  }

  toggleCart(): void {
    if (!this.authService.isAuthenticated()) {
      this.toastr.error('Please log in to view your cart', 'Authentication Required');
      return;
    }
    this.isCartOpen = !this.isCartOpen;
  }

  closeCart(): void {
    this.isCartOpen = false;
  }

  handleUserClick(): void {
    if (this.isAuthenticated) {
      if (this.isAdmin) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/profile']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  @HostListener('document:click', ['$event.target'])
  onOutsideClick(target: HTMLElement) {
    const clickedInside = target.closest('.search-container');
    if (!clickedInside) {
      this.clearSearch();
    }
  }
}
