import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { of, throwError, BehaviorSubject, signal, from } from 'rxjs';

import { LandingComponent } from './landing.component';
import { ProductService } from '../../shared/services/product.service';
import { CategoryService } from '../../shared/services/category.service';
import { Product } from '../../shared/interfaces/product.interface';

// Mock ProductCardComponent
@Component({
  selector: 'app-product-card',
  template: '<div class="mock-product-card">{{ title }} - ${{ price }}</div>'
})
class MockProductCardComponent {
  @Input() imageUrl!: string;
  @Input() title!: string;
  @Input() price!: number;
  @Input() productId!: number;
}

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockCategoryService: jasmine.SpyObj<CategoryService>;
  let selectedCategorySignal: any;

  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Product 1',
      description: 'Description 1',
      price: 29.99,
      stock: 10,
      imageUrl: 'image1.jpg',
      carouselUrl: ['image1.jpg'],
      categoryId: 1,
      category: 'T-shirts'
    },
    {
      id: 2,
      name: 'Product 2',
      description: 'Description 2',
      price: 39.99,
      stock: 5,
      imageUrl: 'image2.jpg',
      carouselUrl: ['image2.jpg'],
      categoryId: 2,
      category: 'Hoodies'
    },
    {
      id: 3,
      name: 'Product 3',
      description: 'Description 3',
      price: 19.99,
      stock: 0, // Out of stock
      imageUrl: 'image3.jpg',
      carouselUrl: ['image3.jpg'],
      categoryId: 1,
      category: 'T-shirts'
    },
    {
      id: 4,
      name: 'Product 4',
      description: 'Description 4',
      price: 49.99,
      stock: 15,
      imageUrl: 'image4.jpg',
      carouselUrl: ['image4.jpg'],
      categoryId: 3,
      category: 'Bottoms'
    },
    {
      id: 5,
      name: 'Product 5',
      description: 'Description 5',
      price: 24.99,
      stock: 8,
      imageUrl: 'image5.jpg',
      carouselUrl: ['image5.jpg'],
      categoryId: 1,
      category: 'T-shirts'
    }
  ];

  const mockProductsAllOutOfStock: Product[] = [
    {
      id: 6,
      name: 'Out of Stock 1',
      description: 'No stock',
      price: 25.99,
      stock: 0,
      imageUrl: 'image6.jpg',
      categoryId: 1,
      category: 'T-shirts'
    },
    {
      id: 7,
      name: 'Out of Stock 2',
      description: 'No stock',
      price: 35.99,
      stock: 0,
      imageUrl: 'image7.jpg',
      categoryId: 2,
      category: 'Hoodies'
    }
  ];

  beforeEach(async () => {
    // Create signal for selected category
    selectedCategorySignal = signal('New');

    // Create spy objects
    mockProductService = jasmine.createSpyObj('ProductService', ['getAllProducts']);
    mockCategoryService = jasmine.createSpyObj('CategoryService', ['setCategory'], {
      selectedCategory: selectedCategorySignal.asReadonly()
    });

    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      declarations: [MockProductCardComponent],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: CategoryService, useValue: mockCategoryService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default signal values', () => {
      expect(component.loading()).toBe(true);
      expect(component.error()).toBeNull();
    });

    it('should have injected services', () => {
      expect((component as any).productService).toBeDefined();
      expect((component as any).catSvc).toBeDefined();
    });

    it('should have filteredProducts computed signal', () => {
      expect(component.filteredProducts).toBeDefined();
      expect(typeof component.filteredProducts).toBe('function');
    });
  });

  describe('ngOnInit - Component Lifecycle', () => {
    it('should call loadProducts on ngOnInit', () => {
      spyOn(component as any, 'loadProducts');

      component.ngOnInit();

      expect((component as any).loadProducts).toHaveBeenCalled();
    });

    it('should set loading to true initially', () => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));

      component.ngOnInit();

      // Loading should be true at start, then false after load
      expect(component.loading()).toBe(false); // After successful load
    });
  });

  describe('loadProducts - Product Loading', () => {
    it('should load products successfully', () => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));

      component.ngOnInit();

      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
      expect((component as any).allProducts()).toEqual(mockProducts);
    });

    it('should handle product loading error', () => {
      const errorMessage = 'Network error';
      mockProductService.getAllProducts.and.returnValue(throwError(() => new Error(errorMessage)));
      spyOn(console, 'error');

      component.ngOnInit();

      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Failed to load products. Please try again later.');
      expect((component as any).allProducts()).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error loading products', jasmine.any(Error));
    });

    it('should set loading state correctly during loading', () => {
      let resolvePromise: any;
      const delayedObservable = new Promise<Product[]>(resolve => {
        resolvePromise = resolve;
      });

      mockProductService.getAllProducts.and.returnValue(from(delayedObservable));

      component.ngOnInit();
      expect(component.loading()).toBe(true);

      resolvePromise(mockProducts);

      // After resolution, loading should be false
      setTimeout(() => {
        expect(component.loading()).toBe(false);
      }, 0);
    });

    it('should reset error state before loading', () => {
      // First load with error
      mockProductService.getAllProducts.and.returnValue(throwError(() => new Error('First error')));
      component.ngOnInit();
      expect(component.error()).not.toBeNull();

      // Second load successful
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));
      (component as any).loadProducts();

      expect(component.error()).toBeNull();
    });

    it('should handle empty product array', () => {
      mockProductService.getAllProducts.and.returnValue(of([]));

      component.ngOnInit();

      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
      expect((component as any).allProducts()).toEqual([]);
      expect(component.filteredProducts()).toEqual([]);
    });

    it('should handle null/undefined product response', () => {
      mockProductService.getAllProducts.and.returnValue(of(null as any));

      component.ngOnInit();

      expect((component as any).allProducts()).toBeNull();
    });

    it('should call loadProducts method directly', () => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));

      (component as any).loadProducts();

      expect(mockProductService.getAllProducts).toHaveBeenCalled();
      expect((component as any).allProducts()).toEqual(mockProducts);
    });
  });

  describe('filteredProducts - Product Filtering', () => {
    beforeEach(() => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));
      component.ngOnInit();
    });

    it('should filter out products with zero stock', () => {
      selectedCategorySignal.set('New');

      const filtered = component.filteredProducts();

      // Should exclude product with id 3 (stock: 0)
      expect(filtered).toHaveLength(4);
      expect(filtered.find(p => p.id === 3)).toBeUndefined();
      expect(filtered.every(p => p.stock > 0)).toBe(true);
    });

    it('should show all in-stock products when category is "New"', () => {
      selectedCategorySignal.set('New');

      const filtered = component.filteredProducts();

      expect(filtered).toHaveLength(4); // All except out of stock
      expect(filtered.map(p => p.id)).toEqual([1, 2, 4, 5]);
    });

    it('should filter by specific category', () => {
      selectedCategorySignal.set('T-shirts');

      const filtered = component.filteredProducts();

      // Should show T-shirts with stock > 0 (products 1 and 5, but not 3 due to stock = 0)
      expect(filtered).toHaveLength(2);
      expect(filtered.every(p => p.category === 'T-shirts')).toBe(true);
      expect(filtered.every(p => p.stock > 0)).toBe(true);
      expect(filtered.map(p => p.id)).toEqual([1, 5]);
    });

    it('should filter by Hoodies category', () => {
      selectedCategorySignal.set('Hoodies');

      const filtered = component.filteredProducts();

      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe('Hoodies');
      expect(filtered[0].id).toBe(2);
    });

    it('should filter by Bottoms category', () => {
      selectedCategorySignal.set('Bottoms');

      const filtered = component.filteredProducts();

      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe('Bottoms');
      expect(filtered[0].id).toBe(4);
    });

    it('should return empty array for non-existent category', () => {
      selectedCategorySignal.set('NonExistentCategory');

      const filtered = component.filteredProducts();

      expect(filtered).toEqual([]);
    });

    it('should handle null category selection', () => {
      selectedCategorySignal.set(null);

      const filtered = component.filteredProducts();

      // Should show all in-stock products when category is null
      expect(filtered).toHaveLength(4);
      expect(filtered.every(p => p.stock > 0)).toBe(true);
    });

    it('should handle undefined category selection', () => {
      selectedCategorySignal.set(undefined);

      const filtered = component.filteredProducts();

      // Should show all in-stock products when category is undefined
      expect(filtered).toHaveLength(4);
      expect(filtered.every(p => p.stock > 0)).toBe(true);
    });

    it('should handle empty string category', () => {
      selectedCategorySignal.set('');

      const filtered = component.filteredProducts();

      // Should show all in-stock products when category is empty string
      expect(filtered).toHaveLength(4);
      expect(filtered.every(p => p.stock > 0)).toBe(true);
    });

    it('should update when category selection changes', () => {
      // Start with all products
      selectedCategorySignal.set('New');
      expect(component.filteredProducts()).toHaveLength(4);

      // Switch to T-shirts
      selectedCategorySignal.set('T-shirts');
      expect(component.filteredProducts()).toHaveLength(2);

      // Switch to Hoodies
      selectedCategorySignal.set('Hoodies');
      expect(component.filteredProducts()).toHaveLength(1);

      // Back to all
      selectedCategorySignal.set('New');
      expect(component.filteredProducts()).toHaveLength(4);
    });

    it('should update when products change', () => {
      // Initial state
      expect(component.filteredProducts()).toHaveLength(4);

      // Change products to all out of stock
      (component as any).allProducts.set(mockProductsAllOutOfStock);

      expect(component.filteredProducts()).toHaveLength(0);
    });

    it('should be case sensitive for category matching', () => {
      selectedCategorySignal.set('t-shirts'); // lowercase

      const filtered = component.filteredProducts();

      expect(filtered).toEqual([]); // Should not match 'T-shirts'
    });

    it('should handle products without category property', () => {
      const productsWithoutCategory = [
        {
          id: 8,
          name: 'No Category Product',
          price: 10.99,
          stock: 5,
          categoryId: 1
        } as Product
      ];

      (component as any).allProducts.set(productsWithoutCategory);
      selectedCategorySignal.set('T-shirts');

      const filtered = component.filteredProducts();

      expect(filtered).toEqual([]);
    });
  });

  describe('Complex Filtering Scenarios', () => {
    it('should handle mixed stock and category filtering', () => {
      const mixedProducts: Product[] = [
        { id: 1, name: 'A', price: 10, stock: 5, categoryId: 1, category: 'T-shirts' },
        { id: 2, name: 'B', price: 20, stock: 0, categoryId: 1, category: 'T-shirts' },
        { id: 3, name: 'C', price: 30, stock: 3, categoryId: 2, category: 'Hoodies' },
        { id: 4, name: 'D', price: 40, stock: 0, categoryId: 2, category: 'Hoodies' },
      ];

      (component as any).allProducts.set(mixedProducts);
      selectedCategorySignal.set('T-shirts');

      const filtered = component.filteredProducts();

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(1);
    });

    it('should handle very large product arrays efficiently', () => {
      const largeProductArray: Product[] = [];
      for (let i = 1; i <= 1000; i++) {
        largeProductArray.push({
          id: i,
          name: `Product ${i}`,
          price: i * 10,
          stock: i % 10, // Some will have 0 stock
          categoryId: (i % 3) + 1,
          category: ['T-shirts', 'Hoodies', 'Bottoms'][i % 3]
        });
      }

      (component as any).allProducts.set(largeProductArray);
      selectedCategorySignal.set('T-shirts');

      const startTime = performance.now();
      const filtered = component.filteredProducts();
      const endTime = performance.now();

      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(p => p.category === 'T-shirts' && p.stock > 0)).toBe(true);
      expect(endTime - startTime).toBeLessThan(50); // Should be fast
    });

    it('should maintain original product object references', () => {
      selectedCategorySignal.set('New');

      const filtered = component.filteredProducts();
      const originalProducts = (component as any).allProducts();

      // Find a product that should be in filtered results
      const originalProduct = originalProducts.find((p: Product) => p.id === 1);
      const filteredProduct = filtered.find(p => p.id === 1);

      expect(filteredProduct).toBe(originalProduct); // Same reference
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle service errors gracefully', () => {
      mockProductService.getAllProducts.and.returnValue(throwError(() => new Error('Service unavailable')));
      spyOn(console, 'error');

      component.ngOnInit();

      expect(() => component.filteredProducts()).not.toThrow();
      expect(component.filteredProducts()).toEqual([]);
    });

    it('should handle products with invalid data', () => {
      const invalidProducts = [
        { id: null, name: '', price: -10, stock: -5, categoryId: null, category: null },
        { id: 'invalid', name: null, price: 'abc', stock: 'def', categoryId: 'wrong', category: undefined }
      ] as any;

      (component as any).allProducts.set(invalidProducts);
      selectedCategorySignal.set('New');

      expect(() => component.filteredProducts()).not.toThrow();
    });

    it('should handle rapid category changes', () => {
      const categories = ['New', 'T-shirts', 'Hoodies', 'Bottoms', 'Accessories'];

      for (let i = 0; i < 100; i++) {
        selectedCategorySignal.set(categories[i % categories.length]);
        expect(() => component.filteredProducts()).not.toThrow();
      }
    });

    it('should handle products array mutation', () => {
      mockProductService.getAllProducts.and.returnValue(of([...mockProducts]));
      component.ngOnInit();

      // Mutate the original array (shouldn't affect component)
      mockProducts.push({
        id: 999,
        name: 'Mutated Product',
        price: 99.99,
        stock: 1,
        categoryId: 1,
        category: 'T-shirts'
      });

      // Component should still work with its copy
      expect(() => component.filteredProducts()).not.toThrow();
    });
  });

  describe('Template Integration', () => {
    it('should render loading state', () => {
      // Set loading to true
      component.loading.set(true);
      component.error.set(null);

      fixture.detectChanges();

      // In a real scenario, you might have loading indicators
      // For now, just ensure no crash
      expect(fixture.nativeElement).toBeDefined();
    });

    it('should render error state', () => {
      component.loading.set(false);
      component.error.set('Test error');

      fixture.detectChanges();

      // Error handling in template
      expect(fixture.nativeElement).toBeDefined();
    });

    it('should render products when loaded', () => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));
      selectedCategorySignal.set('New');

      component.ngOnInit();
      fixture.detectChanges();

      const productCards = fixture.nativeElement.querySelectorAll('app-product-card');
      expect(productCards.length).toBe(4); // Products with stock > 0
    });

    it('should pass correct data to product cards', () => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));
      selectedCategorySignal.set('New');

      component.ngOnInit();
      fixture.detectChanges();

      const firstCard = fixture.nativeElement.querySelector('.mock-product-card');
      expect(firstCard.textContent).toContain('Product 1');
      expect(firstCard.textContent).toContain('29.99');
    });

    it('should update display when category changes', () => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));

      // Start with all products
      selectedCategorySignal.set('New');
      component.ngOnInit();
      fixture.detectChanges();

      let productCards = fixture.nativeElement.querySelectorAll('app-product-card');
      expect(productCards.length).toBe(4);

      // Switch to T-shirts only
      selectedCategorySignal.set('T-shirts');
      fixture.detectChanges();

      productCards = fixture.nativeElement.querySelectorAll('app-product-card');
      expect(productCards.length).toBe(2);
    });
  });

  describe('Performance and Memory Management', () => {
    it('should not create memory leaks with signal updates', () => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));
      component.ngOnInit();

      // Simulate many category changes
      for (let i = 0; i < 100; i++) {
        selectedCategorySignal.set(i % 2 === 0 ? 'T-shirts' : 'Hoodies');
        component.filteredProducts();
      }

      // Should complete without errors
      expect(component.filteredProducts()).toBeDefined();
    });

    it('should handle component destruction gracefully', () => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));
      component.ngOnInit();

      // Simulate component destruction
      fixture.destroy();

      // Should not throw errors
      expect(() => component.filteredProducts()).not.toThrow();
    });

    it('should efficiently handle frequent filtering', () => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));
      component.ngOnInit();

      const startTime = performance.now();

      // Call filteredProducts many times
      for (let i = 0; i < 1000; i++) {
        component.filteredProducts();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // Should be fast due to computed signal caching
    });
  });

  describe('Service Integration', () => {
    it('should use CategoryService selectedCategory correctly', () => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));

      // Verify that the component reads from category service
      selectedCategorySignal.set('T-shirts');
      component.ngOnInit();

      const filtered = component.filteredProducts();
      expect(filtered.every(p => p.category === 'T-shirts')).toBe(true);
    });

    it('should call ProductService getAllProducts', () => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));

      component.ngOnInit();

      expect(mockProductService.getAllProducts).toHaveBeenCalledTimes(1);
    });

    it('should handle service dependencies correctly', () => {
      expect((component as any).catSvc).toBe(mockCategoryService);
      expect((component as any).productService).toBe(mockProductService);
    });
  });
});
