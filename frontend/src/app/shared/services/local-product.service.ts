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
          name: 'Classic Black T-Shirt',
          description: 'Comfortable cotton t-shirt perfect for everyday wear',
          price: 29.99,
          stock: 25,
          imageUrl: 'https://www.crtz.xyz/cdn/shop/files/Sunglasses_Blue_03.png?v=1726478432',
          carouselUrl: [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
            'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400'
          ],
          category: 'T-shirts',
          categoryId: 1
        },
        {
          id: 2,
          name: 'Cozy Pullover Hoodie',
          description: 'Warm and comfortable hoodie for cool weather',
          price: 59.99,
          stock: 18,
          imageUrl: 'https://www.crtz.xyz/cdn/shop/files/GUERILLAZCONVERTIBLEJACKET_GREENCAMO_03.png?v=1753830286',
          carouselUrl: [
            'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
          ],
          category: 'Hoodies',
          categoryId: 2
        },
        {
          id: 3,
          name: 'Slim Fit Jeans',
          description: 'Modern slim fit jeans in classic denim blue',
          price: 79.99,
          stock: 20,
          imageUrl: 'https://www.crtz.xyz/cdn/shop/files/SPRINGJACKET_BLACK_02.png?v=1750947384',
          carouselUrl: [
            'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
            'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=400'
          ],
          category: 'Bottoms',
          categoryId: 3
        },
        {
          id: 4,
          name: 'Baseball Cap',
          description: 'Classic baseball cap with adjustable strap',
          price: 24.99,
          stock: 30,
          imageUrl: 'https://www.crtz.xyz/cdn/shop/files/BBKNEWERACAP_BLACKWHITE_01_d903e991-7072-4736-8048-621616ea1e3e.png?v=1754175037',
          carouselUrl: [
            'https://images.unsplash.com/photo-1575428652377-a312cfda7b09?w=400'
          ],
          category: 'Hats',
          categoryId: 4
        },
        {
          id: 5,
          name: 'Leather Wallet',
          description: 'Genuine leather wallet with multiple card slots',
          price: 39.99,
          stock: 15,
          imageUrl: 'https://www.crtz.xyz/cdn/shop/files/ALCPUFFZIPHOODIE_CAMO_02.png?v=1752249989',
          carouselUrl: [
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
            'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400'
          ],
          category: 'Accessories',
          categoryId: 5
        }
      ];

      this.saveProducts(sampleProducts);
      localStorage.setItem(this.PRODUCT_ID_COUNTER_KEY, '5');
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
      product.description!.toLowerCase().includes(lowerQuery) ||
      product.category!.toLowerCase().includes(lowerQuery)
    );
  }

  getProductsByCategory(category: string): Product[] {
    const products = this.getAllProducts();
    return products.filter(product =>
      product.category!.toLowerCase() === category.toLowerCase()
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
