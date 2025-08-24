import { Injectable } from '@angular/core';
import { Product } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class LocalProductService {
  private readonly PRODUCTS_KEY = 'vallmere_products';
  private readonly PRODUCT_ID_COUNTER_KEY = 'vallmere_product_id_counter';

  constructor() {
    this.initializeSampleProducts();
  }

  // Initialize sample products if none exist
  private initializeSampleProducts(): void {
    const existingProducts = this.getAllProducts();
    if (existingProducts.length === 0) {
      const sampleProducts: Product[] = [
        {
          id: 1,
          name: 'Lydia Matte Satin Dress',
          description: 'Elegant matte satin dress perfect for special occasions',
          price: 129.99,
          stock: 15,
          imageUrl: '/Lydia Matte Satin Dress - Plum.jpg',
          carouselUrl: ['/Lydia Matte Satin Dress - Plum.jpg'],
          category: 'Dresses'
        },
        {
          id: 2,
          name: 'Mock Neck Long Sleeve Mini Dress',
          description: 'Stylish mock neck mini dress for modern look',
          price: 89.99,
          stock: 20,
          imageUrl: '/Mock Neck Long Sleeve Mini Dress - Black _ S.jpg',
          carouselUrl: ['/Mock Neck Long Sleeve Mini Dress - Black _ S.jpg'],
          category: 'Dresses'
        },
        {
          id: 3,
          name: 'Serenity Satin Bridal Dress',
          description: 'Beautiful bridal dress in custom colors and sizes',
          price: 299.99,
          stock: 8,
          imageUrl: '/Serenity Satin Bridal Dress - Custom color _ Custom size.jpg',
          carouselUrl: ['/Serenity Satin Bridal Dress - Custom color _ Custom size.jpg'],
          category: 'Bridal'
        },
        {
          id: 4,
          name: 'Vestido Corto con Frunces',
          description: 'Short dress with crossed ruching in deep red',
          price: 79.99,
          stock: 12,
          imageUrl: '/Vestido corto de manga larga con frunces cruzados - Deep Red _ L.jpg',
          carouselUrl: ['/Vestido corto de manga larga con frunces cruzados - Deep Red _ L.jpg'],
          category: 'Dresses'
        }
      ];

      this.saveProducts(sampleProducts);
      localStorage.setItem(this.PRODUCT_ID_COUNTER_KEY, '4');
    }
  }

  getAllProducts(): Product[] {
    const productsData = localStorage.getItem(this.PRODUCTS_KEY);
    return productsData ? JSON.parse(productsData) : [];
  }

  getProductById(id: number): Product | null {
    const products = this.getAllProducts();
    return products.find(product => product.id === id) || null;
  }

  createProduct(product: Omit<Product, 'id'>): Product {
    const products = this.getAllProducts();
    const newId = this.getNextProductId();
    
    const newProduct: Product = {
      ...product,
      id: newId
    };
    
    products.push(newProduct);
    this.saveProducts(products);
    
    return newProduct;
  }

  updateProduct(id: number, updates: Partial<Product>): Product | null {
    const products = this.getAllProducts();
    const productIndex = products.findIndex(product => product.id === id);
    
    if (productIndex === -1) {
      return null;
    }
    
    products[productIndex] = { ...products[productIndex], ...updates };
    this.saveProducts(products);
    
    return products[productIndex];
  }

  deleteProduct(id: number): boolean {
    const products = this.getAllProducts();
    const filteredProducts = products.filter(product => product.id !== id);
    
    if (filteredProducts.length === products.length) {
      return false; // Product not found
    }
    
    this.saveProducts(filteredProducts);
    return true;
  }

  updateProductStock(id: number, newStock: number): boolean {
    const product = this.updateProduct(id, { stock: newStock });
    return product !== null;
  }

  // Search and filter methods
  searchProducts(query: string): Product[] {
    const products = this.getAllProducts();
    const lowerQuery = query.toLowerCase();
    
    return products.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery)
    );
  }

  getProductsByCategory(category: string): Product[] {
    const products = this.getAllProducts();
    return products.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
  }

  getProductsInPriceRange(minPrice: number, maxPrice: number): Product[] {
    const products = this.getAllProducts();
    return products.filter(product => 
      product.price >= minPrice && product.price <= maxPrice
    );
  }

  getProductsInStock(): Product[] {
    const products = this.getAllProducts();
    return products.filter(product => product.stock > 0);
  }

  // Private helper methods
  private saveProducts(products: Product[]): void {
    localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
  }

  private getNextProductId(): number {
    const currentId = parseInt(localStorage.getItem(this.PRODUCT_ID_COUNTER_KEY) || '0');
    const nextId = currentId + 1;
    localStorage.setItem(this.PRODUCT_ID_COUNTER_KEY, nextId.toString());
    return nextId;
  }

  // Utility methods for data management
  clearAllProducts(): void {
    localStorage.removeItem(this.PRODUCTS_KEY);
    localStorage.removeItem(this.PRODUCT_ID_COUNTER_KEY);
  }

  exportProductData(): string {
    const data = {
      products: this.getAllProducts(),
      productIdCounter: localStorage.getItem(this.PRODUCT_ID_COUNTER_KEY)
    };
    return JSON.stringify(data, null, 2);
  }

  importProductData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.products && Array.isArray(data.products)) {
        this.saveProducts(data.products);
        if (data.productIdCounter) {
          localStorage.setItem(this.PRODUCT_ID_COUNTER_KEY, data.productIdCounter);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing product data:', error);
      return false;
    }
  }
}
