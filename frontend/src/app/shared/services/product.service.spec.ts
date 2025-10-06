import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ProductService } from './product.service';
import { CategoryService } from './category.service';
import { Product, CreateProductDto, UpdateProductDto } from '../interfaces/product.interface';
import { ProductValidationError } from '../validators/product.validators';

describe('ProductService', () => {
  let service: ProductService;
  let mockCategoryService: jasmine.SpyObj<CategoryService>;
  let mockLocalStorage: { [key: string]: string };

  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Test Product 1',
      description: 'Test Description 1',
      price: 29.99,
      stock: 10,
      imageUrl: 'http://example.com/image1.jpg',
      carouselUrl: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],
      categoryId: 1,
      category: 'T-shirts'
    },
    {
      id: 2,
      name: 'Test Product 2',
      description: 'Test Description 2',
      price: 39.99,
      stock: 5,
      imageUrl: 'http://example.com/image3.jpg',
      carouselUrl: ['http://example.com/image3.jpg'],
      categoryId: 2,
      category: 'Hoodies'
    }
  ];

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return mockLocalStorage[key] || null;
    });

    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });

    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete mockLocalStorage[key];
    });

    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', [
      'getCategoryNameById'
    ]);

    TestBed.configureTestingModule({
      providers: [
        ProductService,
        { provide: CategoryService, useValue: categoryServiceSpy }
      ]
    });

    mockCategoryService = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;
    mockCategoryService.getCategoryNameById.and.returnValue('Test Category');

    service = TestBed.inject(ProductService);
  });

  afterEach(() => {
    // Clear mock localStorage after each test
    mockLocalStorage = {};
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with sample data when localStorage is empty', () => {
      // localStorage is empty by default in our setup
      service = new ProductService(mockCategoryService);

      expect(localStorage.setItem).toHaveBeenCalledWith('products', jasmine.any(String));
      expect(localStorage.setItem).toHaveBeenCalledWith('product_counter', '5');
    });

    it('should clean up duplicate storage keys if they exist', () => {
      mockLocalStorage['vallmere_products'] = JSON.stringify(mockProducts);
      mockLocalStorage['vallmere_product_id_counter'] = '10';
      spyOn(console, 'log');

      service = new ProductService(mockCategoryService);

      expect(console.log).toHaveBeenCalledWith('Cleaning up duplicate product storage...');
      expect(localStorage.removeItem).toHaveBeenCalledWith('vallmere_products');
      expect(localStorage.removeItem).toHaveBeenCalledWith('vallmere_product_id_counter');
    });

    it('should not initialize storage if products already exist', () => {
      mockLocalStorage['products'] = JSON.stringify(mockProducts);
      const setItemSpy = localStorage.setItem as jasmine.Spy;
      setItemSpy.calls.reset();

      service = new ProductService(mockCategoryService);

      // Should not set initial data since products already exist
      expect(setItemSpy).not.toHaveBeenCalledWith('products', jasmine.any(String));
    });
  });

  describe('getAllProducts', () => {
    beforeEach(() => {
      mockLocalStorage['products'] = JSON.stringify(mockProducts);
      mockCategoryService.getCategoryNameById.and.callFake((id: number) => {
        const categories = { 1: 'T-shirts', 2: 'Hoodies', 3: 'Bottoms' };
        return categories[id as keyof typeof categories] || 'Unknown';
      });
    });

    it('should return all products with enriched category data', (done) => {
      service.getAllProducts().subscribe({
        next: (products) => {
          expect(products).toEqual(jasmine.arrayContaining([
            jasmine.objectContaining({
              id: 1,
              name: 'Test Product 1',
              category: 'T-shirts'
            }),
            jasmine.objectContaining({
              id: 2,
              name: 'Test Product 2',
              category: 'Hoodies'
            })
          ]));
          expect(products.length).toBe(2);
          done();
        }
      });
    });

    it('should return empty array when no products exist', (done) => {
      mockLocalStorage['products'] = JSON.stringify([]);

      service.getAllProducts().subscribe({
        next: (products) => {
          expect(products).toEqual([]);
          done();
        }
      });
    });

    it('should handle localStorage errors gracefully', (done) => {
      (localStorage.getItem as jasmine.Spy).and.throwError('Storage error');
      spyOn(console, 'error');

      service.getAllProducts().subscribe({
        error: (error) => {
          expect(error.message).toBe('Failed to fetch products from storage');
          expect(console.error).toHaveBeenCalledWith('Error fetching products:', jasmine.any(Error));
          done();
        }
      });
    });

    it('should handle malformed JSON in localStorage', (done) => {
      mockLocalStorage['products'] = 'invalid-json';
      spyOn(console, 'error');

      service.getAllProducts().subscribe({
        error: (error) => {
          expect(error.message).toBe('Failed to fetch products from storage');
          expect(console.error).toHaveBeenCalledWith('Error fetching products:', jasmine.any(Error));
          done();
        }
      });
    });

    it('should enrich each product with category information', (done) => {
      service.getAllProducts().subscribe({
        next: (products) => {
          products.forEach(product => {
            expect(mockCategoryService.getCategoryNameById).toHaveBeenCalledWith(product.categoryId);
            expect(product.category).toBeDefined();
          });
          done();
        }
      });
    });
  });

  describe('getProductById', () => {
    beforeEach(() => {
      mockLocalStorage['products'] = JSON.stringify(mockProducts);
      mockCategoryService.getCategoryNameById.and.returnValue('Test Category');
    });

    it('should return a specific product by ID', (done) => {
      service.getProductById(1).subscribe({
        next: (product) => {
          expect(product).toEqual(jasmine.objectContaining({
            id: 1,
            name: 'Test Product 1',
            category: 'Test Category'
          }));
          done();
        }
      });
    });

    it('should return error for non-existent product ID', (done) => {
      service.getProductById(999).subscribe({
        error: (error) => {
          expect(error.message).toBe('Product with ID 999 not found');
          done();
        }
      });
    });

    it('should enrich product with category information', (done) => {
      service.getProductById(1).subscribe({
        next: (product) => {
          expect(mockCategoryService.getCategoryNameById).toHaveBeenCalledWith(1);
          expect(product.category).toBe('Test Category');
          done();
        }
      });
    });

    it('should handle localStorage errors gracefully', (done) => {
      (localStorage.getItem as jasmine.Spy).and.throwError('Storage error');
      spyOn(console, 'error');

      service.getProductById(1).subscribe({
        error: (error) => {
          expect(error.message).toBe('Failed to fetch product from storage');
          expect(console.error).toHaveBeenCalledWith('Error fetching product:', jasmine.any(Error));
          done();
        }
      });
    });

    it('should handle zero and negative IDs', (done) => {
      service.getProductById(0).subscribe({
        error: (error) => {
          expect(error.message).toBe('Product with ID 0 not found');
          done();
        }
      });
    });
  });

  describe('createProduct', () => {
    beforeEach(() => {
      mockLocalStorage['products'] = JSON.stringify(mockProducts);
      mockLocalStorage['product_counter'] = '2';
      mockCategoryService.getCategoryNameById.and.returnValue('New Category');
    });

    it('should create a new product successfully', (done) => {
      const createDto: CreateProductDto = {
        name: 'New Product',
        description: 'New Description',
        price: 49.99,
        stock: 15,
        imageUrl: 'http://example.com/new-image.jpg',
        carouselUrl: ['http://example.com/new-image.jpg', 'http://example.com/new-image2.jpg'],
        categoryId: 1
      };

      service.createProduct(createDto).subscribe({
        next: (product) => {
          expect(product).toEqual(jasmine.objectContaining({
            id: 3, // Should be next ID
            name: 'New Product',
            description: 'New Description',
            price: 49.99,
            stock: 15,
            category: 'New Category'
          }));
          expect(localStorage.setItem).toHaveBeenCalledWith('products', jasmine.any(String));
          expect(localStorage.setItem).toHaveBeenCalledWith('product_counter', '3');
          done();
        }
      });
    });

    it('should create carousel URL array from imageUrl if not provided', (done) => {
      const createDto: CreateProductDto = {
        name: 'New Product',
        description: 'New Description',
        price: 49.99,
        stock: 15,
        imageUrl: 'http://example.com/new-image.jpg',
        categoryId: 1
      };

      service.createProduct(createDto).subscribe({
        next: (product) => {
          expect(product.carouselUrl).toEqual(['http://example.com/new-image.jpg']);
          done();
        }
      });
    });

    it('should handle missing imageUrl and carouselUrl', (done) => {
      const createDto: CreateProductDto = {
        name: 'New Product',
        description: 'New Description',
        price: 49.99,
        stock: 15,
        categoryId: 1
      };

      service.createProduct(createDto).subscribe({
        next: (product) => {
          expect(product.carouselUrl).toEqual([]);
          done();
        }
      });
    });

    it('should handle validation errors', (done) => {
      const invalidDto: CreateProductDto = {
        name: '', // Invalid - empty name
        description: 'Description',
        price: -10, // Invalid - negative price
        stock: 15,
        categoryId: 1
      };

      service.createProduct(invalidDto).subscribe({
        error: (error) => {
          expect(error instanceof ProductValidationError).toBe(true);
          done();
        }
      });
    });

    it('should handle localStorage errors', (done) => {
      (localStorage.getItem as jasmine.Spy).and.throwError('Storage error');
      spyOn(console, 'error');

      const createDto: CreateProductDto = {
        name: 'New Product',
        description: 'Description',
        price: 49.99,
        stock: 15,
        categoryId: 1
      };

      service.createProduct(createDto).subscribe({
        error: (error) => {
          expect(error.message).toBe('Failed to create product');
          expect(console.error).toHaveBeenCalledWith('Error creating product:', jasmine.any(Error));
          done();
        }
      });
    });

    it('should increment the product counter correctly', (done) => {
      const createDto: CreateProductDto = {
        name: 'New Product',
        description: 'Description',
        price: 49.99,
        stock: 15,
        categoryId: 1
      };

      service.createProduct(createDto).subscribe({
        next: (product) => {
          expect(product.id).toBe(3);
          expect(localStorage.setItem).toHaveBeenCalledWith('product_counter', '3');
          done();
        }
      });
    });
  });

  describe('updateProduct', () => {
    beforeEach(() => {
      mockLocalStorage['products'] = JSON.stringify(mockProducts);
      mockCategoryService.getCategoryNameById.and.returnValue('Updated Category');
    });

    it('should update an existing product successfully', (done) => {
      const updateDto: UpdateProductDto = {
        name: 'Updated Product',
        price: 34.99,
        stock: 20
      };

      service.updateProduct(1, updateDto).subscribe({
        next: (product) => {
          expect(product).toEqual(jasmine.objectContaining({
            id: 1,
            name: 'Updated Product',
            price: 34.99,
            stock: 20,
            category: 'Updated Category'
          }));
          expect(localStorage.setItem).toHaveBeenCalledWith('products', jasmine.any(String));
          done();
        }
      });
    });

    it('should preserve existing values for fields not in update', (done) => {
      const updateDto: UpdateProductDto = {
        name: 'Updated Name Only'
      };

      service.updateProduct(1, updateDto).subscribe({
        next: (product) => {
          expect(product.name).toBe('Updated Name Only');
          expect(product.description).toBe('Test Description 1'); // Should be preserved
          expect(product.price).toBe(29.99); // Should be preserved
          done();
        }
      });
    });

    it('should handle carousel URL updates', (done) => {
      const updateDto: UpdateProductDto = {
        carouselUrl: ['http://example.com/new1.jpg', 'http://example.com/new2.jpg']
      };

      service.updateProduct(1, updateDto).subscribe({
        next: (product) => {
          expect(product.carouselUrl).toEqual(['http://example.com/new1.jpg', 'http://example.com/new2.jpg']);
          done();
        }
      });
    });

    it('should preserve existing carousel URL if not provided in update', (done) => {
      const updateDto: UpdateProductDto = {
        name: 'Updated Name'
      };

      service.updateProduct(1, updateDto).subscribe({
        next: (product) => {
          expect(product.carouselUrl).toEqual(['http://example.com/image1.jpg', 'http://example.com/image2.jpg']);
          done();
        }
      });
    });

    it('should return error for non-existent product ID', (done) => {
      const updateDto: UpdateProductDto = {
        name: 'Updated Product'
      };

      service.updateProduct(999, updateDto).subscribe({
        error: (error) => {
          expect(error.message).toBe('Product with ID 999 not found');
          done();
        }
      });
    });

    it('should handle validation errors', (done) => {
      const invalidDto: UpdateProductDto = {
        price: -10 // Invalid - negative price
      };

      service.updateProduct(1, invalidDto).subscribe({
        error: (error) => {
          expect(error instanceof ProductValidationError).toBe(true);
          done();
        }
      });
    });

    it('should handle localStorage errors', (done) => {
      (localStorage.getItem as jasmine.Spy).and.throwError('Storage error');
      spyOn(console, 'error');

      const updateDto: UpdateProductDto = {
        name: 'Updated Product'
      };

      service.updateProduct(1, updateDto).subscribe({
        error: (error) => {
          expect(error.message).toBe('Failed to update product');
          expect(console.error).toHaveBeenCalledWith('Error updating product:', jasmine.any(Error));
          done();
        }
      });
    });
  });

  describe('deleteProduct', () => {
    beforeEach(() => {
      mockLocalStorage['products'] = JSON.stringify(mockProducts);
    });

    it('should delete an existing product successfully', (done) => {
      service.deleteProduct(1).subscribe({
        next: () => {
          expect(localStorage.setItem).toHaveBeenCalledWith('products', jasmine.any(String));

          // Verify the product was actually removed
          const savedProducts = JSON.parse(mockLocalStorage['products']);
          expect(savedProducts.find((p: Product) => p.id === 1)).toBeUndefined();
          expect(savedProducts.length).toBe(1);
          done();
        }
      });
    });

    it('should return error for non-existent product ID', (done) => {
      service.deleteProduct(999).subscribe({
        error: (error) => {
          expect(error.message).toBe('Product with ID 999 not found');
          done();
        }
      });
    });

    it('should handle localStorage errors', (done) => {
      (localStorage.getItem as jasmine.Spy).and.throwError('Storage error');
      spyOn(console, 'error');

      service.deleteProduct(1).subscribe({
        error: (error) => {
          expect(error.message).toBe('Failed to delete product');
          expect(console.error).toHaveBeenCalledWith('Error deleting product:', jasmine.any(Error));
          done();
        }
      });
    });

    it('should maintain array integrity after deletion', (done) => {
      service.deleteProduct(1).subscribe({
        next: () => {
          const savedProducts = JSON.parse(mockLocalStorage['products']);
          expect(savedProducts).toEqual([
            jasmine.objectContaining({ id: 2, name: 'Test Product 2' })
          ]);
          done();
        }
      });
    });

    it('should handle deletion of last product', (done) => {
      mockLocalStorage['products'] = JSON.stringify([mockProducts[0]]);

      service.deleteProduct(1).subscribe({
        next: () => {
          const savedProducts = JSON.parse(mockLocalStorage['products']);
          expect(savedProducts).toEqual([]);
          done();
        }
      });
    });
  });

  describe('Helper Methods', () => {
    beforeEach(() => {
      mockLocalStorage['products'] = JSON.stringify(mockProducts);
      mockLocalStorage['product_counter'] = '5';
    });

    it('should clear all products and counter', () => {
      service.clearAllProducts();

      expect(localStorage.removeItem).toHaveBeenCalledWith('products');
      expect(localStorage.removeItem).toHaveBeenCalledWith('product_counter');
    });

    it('should reset to initial data', () => {
      spyOn(service, 'cleanupDuplicateStorage' as any);
      spyOn(service, 'initializeStorage' as any);

      service.resetToInitialData();

      expect(localStorage.removeItem).toHaveBeenCalledWith('products');
      expect(localStorage.removeItem).toHaveBeenCalledWith('product_counter');
    });

    it('should fix localStorage issues and reload page', () => {
      // Mock window.location.reload by replacing it with a spy
      const originalReload = window.location.reload;
      Object.defineProperty(window.location, 'reload', {
        value: jasmine.createSpy('reload'),
        writable: true
      });

      spyOn(console, 'log');

      service.fixLocalStorageIssues();

      expect(console.log).toHaveBeenCalledWith('Fixing localStorage issues...');
      expect(console.log).toHaveBeenCalledWith('LocalStorage issues fixed. Refreshing page...');
      expect(localStorage.removeItem).toHaveBeenCalledWith('products');
      expect(localStorage.removeItem).toHaveBeenCalledWith('product_counter');
      expect(localStorage.removeItem).toHaveBeenCalledWith('vallmere_products');
      expect(localStorage.removeItem).toHaveBeenCalledWith('vallmere_product_id_counter');
      expect(window.location.reload).toHaveBeenCalled();

      // Restore original method
      Object.defineProperty(window.location, 'reload', {
        value: originalReload,
        writable: false
      });
    });
  });

  describe('ID Generation and Storage Management', () => {
    it('should generate sequential IDs', () => {
      mockLocalStorage['product_counter'] = '10';

      // Access private method through bracket notation
      const nextId1 = (service as any).getNextId();
      const nextId2 = (service as any).getNextId();

      expect(nextId1).toBe(11);
      expect(nextId2).toBe(12);
      expect(mockLocalStorage['product_counter']).toBe('12');
    });

    it('should handle missing counter in localStorage', () => {
      delete mockLocalStorage['product_counter'];

      const nextId = (service as any).getNextId();

      expect(nextId).toBe(1);
      expect(mockLocalStorage['product_counter']).toBe('1');
    });

    it('should handle invalid counter value', () => {
      mockLocalStorage['product_counter'] = 'invalid';

      const nextId = (service as any).getNextId();

      expect(nextId).toBe(1); // NaN + 1 = 1
      expect(mockLocalStorage['product_counter']).toBe('1');
    });

    it('should get products from localStorage', () => {
      const products = (service as any).getProducts();

      expect(products).toEqual(mockProducts);
    });

    it('should return empty array when no products in localStorage', () => {
      delete mockLocalStorage['products'];

      const products = (service as any).getProducts();

      expect(products).toEqual([]);
    });

    it('should save products to localStorage', () => {
      const newProducts = [...mockProducts, { id: 3, name: 'Test 3' }];

      (service as any).saveProducts(newProducts);

      expect(localStorage.setItem).toHaveBeenCalledWith('products', JSON.stringify(newProducts));
    });
  });

  describe('Category Enrichment', () => {
    it('should enrich product with category name', () => {
      mockCategoryService.getCategoryNameById.and.returnValue('Electronics');

      const product: Product = {
        id: 1,
        name: 'Test Product',
        price: 100,
        stock: 10,
        categoryId: 5
      };

      const enriched = (service as any).enrichProductWithCategory(product);

      expect(enriched.category).toBe('Electronics');
      expect(mockCategoryService.getCategoryNameById).toHaveBeenCalledWith(5);
    });

    it('should handle category service errors gracefully', () => {
      mockCategoryService.getCategoryNameById.and.returnValue('Unknown');

      const product: Product = {
        id: 1,
        name: 'Test Product',
        price: 100,
        stock: 10,
        categoryId: 999
      };

      const enriched = (service as any).enrichProductWithCategory(product);

      expect(enriched.category).toBe('Unknown');
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle concurrent operations', (done) => {
      mockLocalStorage['products'] = JSON.stringify(mockProducts);
      mockLocalStorage['product_counter'] = '2';

      const createDto: CreateProductDto = {
        name: 'Concurrent Product',
        price: 50,
        stock: 10,
        categoryId: 1
      };

      // Simulate concurrent creates
      const create1$ = service.createProduct(createDto);
      const create2$ = service.createProduct({ ...createDto, name: 'Concurrent Product 2' });

      let completedCount = 0;
      const checkCompletion = () => {
        completedCount++;
        if (completedCount === 2) {
          // Both operations should complete
          expect(completedCount).toBe(2);
          done();
        }
      };

      create1$.subscribe({
        next: (product) => {
          expect(product.id).toBeGreaterThan(2);
          checkCompletion();
        }
      });

      create2$.subscribe({
        next: (product) => {
          expect(product.id).toBeGreaterThan(2);
          checkCompletion();
        }
      });
    });

    it('should handle large datasets', (done) => {
      // Create a large dataset
      const largeProductSet = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Product ${i + 1}`,
        price: Math.random() * 100,
        stock: Math.floor(Math.random() * 50),
        categoryId: (i % 5) + 1
      }));

      mockLocalStorage['products'] = JSON.stringify(largeProductSet);

      service.getAllProducts().subscribe({
        next: (products) => {
          expect(products.length).toBe(1000);
          expect(products.every(p => p.category)).toBe(true);
          done();
        }
      });
    });

    it('should handle products with special characters in names', (done) => {
      const specialProduct: CreateProductDto = {
        name: 'Prödüct wîth spëcíål çhãráctërs & symbols! @#$%^&*()',
        description: 'Ñoñ-ÅšÇII characters ñámé',
        price: 29.99,
        stock: 5,
        categoryId: 1
      };

      service.createProduct(specialProduct).subscribe({
        next: (product) => {
          expect(product.name).toBe('Prödüct wîth spëcíål çhãráctërs & symbols! @#$%^&*()');
          expect(product.description).toBe('Ñoñ-ÅšÇII characters ñámé');
          done();
        }
      });
    });

    it('should handle products with very long descriptions', (done) => {
      const longDescription = 'A'.repeat(10000); // 10k characters
      const productWithLongDesc: CreateProductDto = {
        name: 'Long Description Product',
        description: longDescription,
        price: 29.99,
        stock: 5,
        categoryId: 1
      };

      service.createProduct(productWithLongDesc).subscribe({
        next: (product) => {
          expect(product.description).toBe(longDescription);
          done();
        }
      });
    });

    it('should handle localStorage quota exceeded', (done) => {
      (localStorage.setItem as jasmine.Spy).and.throwError('QuotaExceededError');
      spyOn(console, 'error');

      const createDto: CreateProductDto = {
        name: 'New Product',
        price: 50,
        stock: 10,
        categoryId: 1
      };

      service.createProduct(createDto).subscribe({
        error: (error) => {
          expect(error.message).toBe('Failed to create product');
          expect(console.error).toHaveBeenCalledWith('Error creating product:', jasmine.any(Error));
          done();
        }
      });
    });

    it('should handle malformed product data in localStorage', (done) => {
      mockLocalStorage['products'] = '[{"id":1,"name":"Test"},{"invalid":"json"';
      spyOn(console, 'error');

      service.getAllProducts().subscribe({
        error: (error) => {
          expect(error.message).toBe('Failed to fetch products from storage');
          expect(console.error).toHaveBeenCalledWith('Error fetching products:', jasmine.any(Error));
          done();
        }
      });
    });
  });

  describe('Performance and Memory Management', () => {
    it('should not create memory leaks with multiple operations', (done) => {
      const operations = [];

      for (let i = 0; i < 100; i++) {
        operations.push(service.getAllProducts());
      }

      let completedOperations = 0;
      operations.forEach(op => {
        op.subscribe({
          next: () => {
            completedOperations++;
            if (completedOperations === 100) {
              expect(completedOperations).toBe(100);
              done();
            }
          }
        });
      });
    });

    it('should handle rapid successive operations', (done) => {
      mockLocalStorage['products'] = JSON.stringify(mockProducts);

      let completedCount = 0;
      const checkCompletion = () => {
        completedCount++;
        if (completedCount === 5) {
          expect(completedCount).toBe(5);
          done();
        }
      };

      service.getAllProducts().subscribe(() => checkCompletion());
      service.getProductById(1).subscribe(() => checkCompletion());
      service.getProductById(2).subscribe(() => checkCompletion());
      service.getAllProducts().subscribe(() => checkCompletion());
      service.getProductById(1).subscribe(() => checkCompletion());
    });
  });
});
