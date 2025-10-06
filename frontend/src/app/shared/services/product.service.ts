import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Product, CreateProductDto, UpdateProductDto } from '../interfaces/product.interface';
import { CategoryService } from './category.service';
import { ProductValidators, ProductValidationError } from '../validators/product.validators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly STORAGE_KEY = 'products';
  private readonly COUNTER_KEY = 'product_counter';

  constructor(private readonly categoryService: CategoryService) {
    this.cleanupDuplicateStorage();
    this.initializeStorage();
  }

  private cleanupDuplicateStorage(): void {
    // Remove old duplicate storage keys if they exist
    const oldProducts = localStorage.getItem('vallmere_products');

    if (oldProducts) {
      console.log('Cleaning up duplicate product storage...');
      localStorage.removeItem('vallmere_products');
      localStorage.removeItem('vallmere_product_id_counter');
    }
  }

  private initializeStorage(): void {
    const products = localStorage.getItem(this.STORAGE_KEY);
    if (!products) {
      this.seedInitialData();
    }
  }

  private seedInitialData(): void {
    const sampleProducts: Product[] = [
      {
        id: 1,
        name: 'Classic Black T-Shirt',
        description: 'Comfortable cotton t-shirt perfect for everyday wear.',
        price: 29.99,
        stock: 25,
        imageUrl: 'https://www.crtz.xyz/cdn/shop/files/CYPHERJERSEY_BLACK_01.png?v=1750757377&width=1024',
        carouselUrl: [
          'https://www.crtz.xyz/cdn/shop/files/CYPHERJERSEY_BLACK_02.png?v=1750757378',
          'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400'
        ],
        categoryId: 1,
        category: 'T-shirts'
      },
      {
        id: 2,
        name: 'Cozy Pullover Hoodie',
        description: 'Warm and comfortable hoodie for cool weather.',
        price: 59.99,
        stock: 18,
        imageUrl: 'https://www.crtz.xyz/cdn/shop/files/BOYBETTERKNOWSHUKUPANT_BLACK_02.png?v=1749736335',
        carouselUrl: [
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
        ],
        categoryId: 2,
        category: 'Hoodies'
      },
      {
        id: 3,
        name: 'Slim Fit Jeans',
        description: 'Modern slim fit jeans in classic denim blue.',
        price: 79.99,
        stock: 20,
        imageUrl: 'https://www.crtz.xyz/cdn/shop/files/DUALSTRIPEDENIMBAGGYJEANS_STONEWASH_01.png?v=1751028586',
        carouselUrl: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
          'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=400'
        ],
        categoryId: 3,
        category: 'Bottoms'
      },
      {
        id: 4,
        name: 'Baseball Cap',
        description: 'Classic baseball cap with adjustable strap.',
        price: 24.99,
        stock: 30,
        imageUrl: 'https://www.crtz.xyz/cdn/shop/files/BBKROYALEOPENHEMPANT_BLACK_02.png?v=1749736246',
        carouselUrl: [
          'https://images.unsplash.com/photo-1575428652377-a312cfda7b09?w=400'
        ],
        categoryId: 4,
        category: 'Hats'
      },
      {
        id: 5,
        name: 'Leather Wallet',
        description: 'Genuine leather wallet with multiple card slots.',
        price: 39.99,
        stock: 15,
        imageUrl: 'https://www.crtz.xyz/cdn/shop/files/ISLANDPUFFPRINTTEE_ARCTICCAMO_01_1.png?v=1754060148',
        carouselUrl: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
          'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400'
        ],
        categoryId: 5,
        category: 'Accessories'
      }
    ];

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sampleProducts));
    localStorage.setItem(this.COUNTER_KEY, '5');
  }

  private getProducts(): Product[] {
    const products = localStorage.getItem(this.STORAGE_KEY);
    return products ? JSON.parse(products) : [];
  }

  private saveProducts(products: Product[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products));
  }

  private getNextId(): number {
    const counter = localStorage.getItem(this.COUNTER_KEY);
    const nextId = counter ? parseInt(counter) + 1 : 1;
    localStorage.setItem(this.COUNTER_KEY, nextId.toString());
    return nextId;
  }

    private enrichProductWithCategory(product: Product): Product {
    // Get category name using CategoryService helper method
    const categoryName = this.categoryService.getCategoryNameById(product.categoryId);
    return {
      ...product,
      category: categoryName
    };
  }

  getAllProducts(): Observable<Product[]> {
    try {
      const products = this.getProducts();
      const enrichedProducts = products.map(product => this.enrichProductWithCategory(product));
      return of(enrichedProducts);
    } catch (error) {
          console.error('Error fetching products:', error);
      return throwError(() => new Error('Failed to fetch products from storage'));
    }
  }

  getProductById(id: number): Observable<Product> {
    try {
      const products = this.getProducts();
      const product = products.find(p => p.id === id);

      if (!product) {
        return throwError(() => new Error(`Product with ID ${id} not found`));
      }

      const enrichedProduct = this.enrichProductWithCategory(product);
      return of(enrichedProduct);
    } catch (error) {
          console.error('Error fetching product:', error);
      return throwError(() => new Error('Failed to fetch product from storage'));
    }
  }

  createProduct(createProductDto: CreateProductDto): Observable<Product> {
    try {
      // Validate the input
      ProductValidators.validateAndThrow(createProductDto, false);

      const products = this.getProducts();
      const newProduct: Product = {
        ...createProductDto,
        id: this.getNextId(),
        carouselUrl: createProductDto.carouselUrl || (createProductDto.imageUrl ? [createProductDto.imageUrl] : [])
      };

      products.push(newProduct);
      this.saveProducts(products);

      const enrichedProduct = this.enrichProductWithCategory(newProduct);
      return of(enrichedProduct);
    } catch (error) {
          console.error('Error creating product:', error);
      if (error instanceof ProductValidationError) {
          return throwError(() => error);
      }
      return throwError(() => new Error('Failed to create product'));
    }
  }

  updateProduct(id: number, updateProductDto: UpdateProductDto): Observable<Product> {
    try {
      // Validate the input
      ProductValidators.validateAndThrow(updateProductDto, true);

      const products = this.getProducts();
      const productIndex = products.findIndex(p => p.id === id);

      if (productIndex === -1) {
        return throwError(() => new Error(`Product with ID ${id} not found`));
      }

      // Update the product
      const existingProduct = products[productIndex];
      const updatedProduct: Product = {
        ...existingProduct,
        ...updateProductDto,
        carouselUrl: updateProductDto.carouselUrl || existingProduct.carouselUrl
      };

      products[productIndex] = updatedProduct;
      this.saveProducts(products);

      const enrichedProduct = this.enrichProductWithCategory(updatedProduct);
      return of(enrichedProduct);
    } catch (error) {
          console.error('Error updating product:', error);
      if (error instanceof ProductValidationError) {
          return throwError(() => error);
      }
      return throwError(() => new Error('Failed to update product'));
    }
  }

  deleteProduct(id: number): Observable<void> {
    try {
      const products = this.getProducts();
      const productIndex = products.findIndex(p => p.id === id);

      if (productIndex === -1) {
        return throwError(() => new Error(`Product with ID ${id} not found`));
      }

      products.splice(productIndex, 1);
      this.saveProducts(products);

      return of(void 0);
    } catch (error) {
          console.error('Error deleting product:', error);
      return throwError(() => new Error('Failed to delete product'));
    }
  }

  // Helper method to clear all products (useful for testing)
  clearAllProducts(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.COUNTER_KEY);
  }

  // Helper method to reset to initial data
  resetToInitialData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.COUNTER_KEY);
    this.cleanupDuplicateStorage();
    this.initializeStorage();
  }

  // Helper method to fix localStorage issues
  fixLocalStorageIssues(): void {
    console.log('Fixing localStorage issues...');

    // Clean up all product-related storage
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.COUNTER_KEY);
    localStorage.removeItem('vallmere_products');
    localStorage.removeItem('vallmere_product_id_counter');

    // Reinitialize with fresh data
    this.initializeStorage();

    console.log('LocalStorage issues fixed. Refreshing page...');
    window.location.reload();
  }
}
