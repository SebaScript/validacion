import { Component, computed, signal, OnInit } from '@angular/core';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { CommonModule } from '@angular/common';
import { Product } from '../../shared/interfaces/product.interface';
import { CategoryService } from '../../shared/services/category.service';
import { ProductService } from '../../shared/services/product.service';

@Component({
  selector: 'app-landing',
  imports: [ProductCardComponent, CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit{
  private readonly allProducts = signal<Product[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  filteredProducts = computed(() => {
    const cat = this.catSvc.selectedCategory();
    return this.allProducts()
      .filter(p => p.stock > 0)
      .filter(p => !cat || cat === 'New' ? true : p.category === cat);
  });

  constructor(
    private readonly catSvc: CategoryService,
    private readonly productService: ProductService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  private loadProducts() {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.error.set('Failed to load products. Please try again later.');
        this.loading.set(false);
      }
    });
  }
}
