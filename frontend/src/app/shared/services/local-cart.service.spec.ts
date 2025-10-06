import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { LocalCartService } from './local-cart.service';
import { ProductService } from './product.service';
import { Cart, CartItem, AddCartItemRequest, CartTotal } from '../interfaces/cart.interface';
import { Product } from '../interfaces/product.interface';

describe('LocalCartService', () => {
  let service: LocalCartService;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockLocalStorage: { [key: string]: string };

  const mockProduct: Product = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 29.99,
    stock: 10,
    imageUrl: 'http://example.com/image.jpg',
    categoryId: 1
  };

  const mockProduct2: Product = {
    id: 2,
    name: 'Test Product 2',
    description: 'Test Description 2',
    price: 19.99,
    stock: 5,
    imageUrl: 'http://example.com/image2.jpg',
    categoryId: 1
  };

  const mockCart: Cart = {
    cartId: 1,
    userId: 1,
    items: []
  };

  const mockCartItem: CartItem = {
    cartItemId: 1,
    cartId: 1,
    productId: 1,
    quantity: 2,
    product: mockProduct
  };

  const mockAddItemRequest: AddCartItemRequest = {
    productId: 1,
    quantity: 2
  };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete mockLocalStorage[key];
    });

    const productServiceSpy = jasmine.createSpyObj('ProductService', [
      'getProductById'
    ]);

    const toastrSpy = jasmine.createSpyObj('ToastrService', [
      'success', 'error', 'warning', 'info'
    ]);

    TestBed.configureTestingModule({
      providers: [
        LocalCartService,
        { provide: ProductService, useValue: productServiceSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    });

    mockProductService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    mockToastr = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    mockProductService.getProductById.and.returnValue(of(mockProduct));

    service = TestBed.inject(LocalCartService);
  });

  afterEach(() => {
    // Clear localStorage mock
    mockLocalStorage = {};
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should inject dependencies', () => {
      expect(mockProductService).toBeTruthy();
      expect(mockToastr).toBeTruthy();
    });

    it('should have correct localStorage keys', () => {
      expect(service['CARTS_KEY']).toBe('vallmere_carts');
      expect(service['CART_ITEMS_KEY']).toBe('vallmere_cart_items');
      expect(service['CART_ID_COUNTER_KEY']).toBe('vallmere_cart_id_counter');
      expect(service['CART_ITEM_ID_COUNTER_KEY']).toBe('vallmere_cart_item_id_counter');
    });
  });

  describe('Cart Management', () => {
    it('should create cart successfully', async () => {
      const result = await service.createCart(1);

      expect(result.userId).toBe(1);
      expect(result.cartId).toBe(1);
      expect(result.items).toEqual([]);
    });

    it('should generate sequential cart IDs', async () => {
      const cart1 = await service.createCart(1);
      const cart2 = await service.createCart(2);

      expect(cart1.cartId).toBe(1);
      expect(cart2.cartId).toBe(2);
    });

    it('should save cart to localStorage', async () => {
      await service.createCart(1);

      const cartsData = mockLocalStorage['vallmere_carts'];
      expect(cartsData).toBeTruthy();

      const carts = JSON.parse(cartsData);
      expect(carts.length).toBe(1);
      expect(carts[0].userId).toBe(1);
    });

    it('should handle existing cart ID counter', async () => {
      mockLocalStorage['vallmere_cart_id_counter'] = '5';
      const result = await service.createCart(1);

      expect(result.cartId).toBe(6);
    });

    it('should find cart by user ID', async () => {
      await service.createCart(1);
      const result = service.findCartByUserId(1);

      expect(result?.userId).toBe(1);
      expect(result?.cartId).toBe(1);
    });

    it('should return null for non-existent user cart', () => {
      const result = service.findCartByUserId(999);

      expect(result).toBeNull();
    });

    it('should load cart items when finding cart by user ID', async () => {
      const cart = await service.createCart(1);

      // Mock cart items
      const items = [mockCartItem];
      mockLocalStorage['vallmere_cart_items'] = JSON.stringify(items);

      const result = service.findCartByUserId(1);

      expect(result?.items).toEqual(items);
    });

    it('should get or create cart for existing user', async () => {
      await service.createCart(1);
      const result = await service.getOrCreateCart(1);

      expect(result.userId).toBe(1);
      expect(result.cartId).toBe(1);
    });

    it('should get or create cart for new user', async () => {
      const result = await service.getOrCreateCart(1);

      expect(result.userId).toBe(1);
      expect(result.cartId).toBe(1);
    });

    it('should find cart by ID', async () => {
      await service.createCart(1);
      const result = service.findCartById(1);

      expect(result?.cartId).toBe(1);
      expect(result?.userId).toBe(1);
    });

    it('should return null for non-existent cart ID', () => {
      const result = service.findCartById(999);

      expect(result).toBeNull();
    });

    it('should load cart items when finding cart by ID', async () => {
      await service.createCart(1);

      // Mock cart items
      const items = [mockCartItem];
      mockLocalStorage['vallmere_cart_items'] = JSON.stringify(items);

      const result = service.findCartById(1);

      expect(result?.items).toEqual(items);
    });
  });

  describe('Cart Item Management - Add Items', () => {
    beforeEach(() => {
      mockProductService.getProductById.and.returnValue(of(mockProduct));
    });

    it('should add item to cart successfully', async () => {
      const cart = await service.createCart(1);
      const result = await service.addItem(cart.cartId, mockAddItemRequest);

      expect(result.cartId).toBe(cart.cartId);
      expect(result.productId).toBe(mockAddItemRequest.productId);
      expect(result.quantity).toBe(mockAddItemRequest.quantity);
      expect(result.product).toEqual(mockProduct);
    });

    it('should generate sequential cart item IDs', async () => {
      const cart = await service.createCart(1);

      const item1 = await service.addItem(cart.cartId, mockAddItemRequest);
      const item2 = await service.addItem(cart.cartId, {
        productId: 2,
        quantity: 1
      });

      expect(item1.cartItemId).toBe(1);
      expect(item2.cartItemId).toBe(2);
    });

    it('should throw error when cart not found', async () => {
      await expectAsync(service.addItem(999, mockAddItemRequest))
        .toBeRejectedWithError('Cart with ID 999 not found');
    });

    it('should throw error when product not found', async () => {
      mockProductService.getProductById.and.returnValue(throwError(() => new Error('Product not found')));
      const cart = await service.createCart(1);

      await expectAsync(service.addItem(cart.cartId, mockAddItemRequest))
        .toBeRejectedWithError('Product with ID 1 not found');
    });

    it('should throw error when insufficient stock', async () => {
      const lowStockProduct = { ...mockProduct, stock: 1 };
      mockProductService.getProductById.and.returnValue(of(lowStockProduct));
      const cart = await service.createCart(1);

      await expectAsync(service.addItem(cart.cartId, { productId: 1, quantity: 5 }))
        .toBeRejectedWithError('Not enough stock. Available: 1');
    });

    it('should update existing item quantity', async () => {
      const cart = await service.createCart(1);

      // Add item first time
      await service.addItem(cart.cartId, { productId: 1, quantity: 2 });

      // Add same item again
      const result = await service.addItem(cart.cartId, { productId: 1, quantity: 3 });

      expect(result.quantity).toBe(5); // 2 + 3
    });

    it('should throw error when updating existing item exceeds stock', async () => {
      const cart = await service.createCart(1);

      // Add item first time
      await service.addItem(cart.cartId, { productId: 1, quantity: 8 });

      // Try to add more than available stock
      await expectAsync(service.addItem(cart.cartId, { productId: 1, quantity: 5 }))
        .toBeRejectedWithError('Not enough stock. Available: 10, requested: 13');
    });

    it('should add item by user ID', async () => {
      const result = await service.addItemByUserId(1, mockAddItemRequest);

      expect(result.productId).toBe(mockAddItemRequest.productId);
      expect(result.quantity).toBe(mockAddItemRequest.quantity);
    });

    it('should create cart if not exists when adding by user ID', async () => {
      const result = await service.addItemByUserId(1, mockAddItemRequest);

      expect(result).toBeTruthy();
      const cart = service.findCartByUserId(1);
      expect(cart).toBeTruthy();
    });

    it('should handle ProductService errors gracefully', async () => {
      mockProductService.getProductById.and.returnValue(throwError(() => new Error('Service error')));
      const cart = await service.createCart(1);

      await expectAsync(service.addItem(cart.cartId, mockAddItemRequest))
        .toBeRejectedWithError('Product with ID 1 not found');
    });

    it('should handle existing cart item ID counter', async () => {
      mockLocalStorage['vallmere_cart_item_id_counter'] = '5';
      const cart = await service.createCart(1);
      const result = await service.addItem(cart.cartId, mockAddItemRequest);

      expect(result.cartItemId).toBe(6);
    });
  });

  describe('Cart Item Management - Update Items', () => {
    beforeEach(() => {
      mockProductService.getProductById.and.returnValue(of(mockProduct));
    });

    it('should update item quantity successfully', async () => {
      const cart = await service.createCart(1);
      const item = await service.addItem(cart.cartId, mockAddItemRequest);

      const result = await service.updateItemQuantity(cart.cartId, item.cartItemId, 5);

      expect(result.quantity).toBe(5);
      expect(result.product).toEqual(mockProduct);
    });

    it('should throw error for quantity less than 1', async () => {
      const cart = await service.createCart(1);

      await expectAsync(service.updateItemQuantity(cart.cartId, 1, 0))
        .toBeRejectedWithError('Quantity must be at least 1');
    });

    it('should throw error for non-existent cart item', async () => {
      const cart = await service.createCart(1);

      await expectAsync(service.updateItemQuantity(cart.cartId, 999, 2))
        .toBeRejectedWithError('Cart item with ID 999 not found in cart 1');
    });

    it('should throw error when quantity exceeds stock', async () => {
      const cart = await service.createCart(1);
      const item = await service.addItem(cart.cartId, mockAddItemRequest);

      await expectAsync(service.updateItemQuantity(cart.cartId, item.cartItemId, 15))
        .toBeRejectedWithError('Not enough stock. Available: 10');
    });

    it('should update product details when updating quantity', async () => {
      const cart = await service.createCart(1);
      const item = await service.addItem(cart.cartId, mockAddItemRequest);

      // Mock updated product
      const updatedProduct = { ...mockProduct, price: 39.99 };
      mockProductService.getProductById.and.returnValue(of(updatedProduct));

      const result = await service.updateItemQuantity(cart.cartId, item.cartItemId, 3);

      expect(result.product.price).toBe(39.99);
    });

    it('should throw error when product not found during update', async () => {
      const cart = await service.createCart(1);
      const item = await service.addItem(cart.cartId, mockAddItemRequest);

      mockProductService.getProductById.and.returnValue(throwError(() => new Error('Product not found')));

      await expectAsync(service.updateItemQuantity(cart.cartId, item.cartItemId, 3))
        .toBeRejectedWithError('Product with ID 1 not found');
    });
  });

  describe('Cart Item Management - Remove Items', () => {
    it('should remove item successfully', async () => {
      const cart = await service.createCart(1);
      const item = await service.addItem(cart.cartId, mockAddItemRequest);

      service.removeItem(cart.cartId, item.cartItemId);

      const updatedCart = service.findCartById(cart.cartId);
      expect(updatedCart?.items.length).toBe(0);
    });

    it('should throw error when removing non-existent item', () => {
      expect(() => service.removeItem(1, 999))
        .toThrowError('Cart item with ID 999 not found in cart 1');
    });

    it('should clear all items from cart', async () => {
      const cart = await service.createCart(1);
      await service.addItem(cart.cartId, mockAddItemRequest);
      await service.addItem(cart.cartId, { productId: 2, quantity: 1 });

      service.clearCart(cart.cartId);

      const updatedCart = service.findCartById(cart.cartId);
      expect(updatedCart?.items.length).toBe(0);
    });

    it('should remove cart and all its items', async () => {
      const cart = await service.createCart(1);
      await service.addItem(cart.cartId, mockAddItemRequest);

      service.removeCart(cart.cartId);

      const foundCart = service.findCartById(cart.cartId);
      expect(foundCart).toBeNull();
    });

    it('should throw error when removing non-existent cart', () => {
      expect(() => service.removeCart(999))
        .toThrowError('Cart with ID 999 not found');
    });

    it('should not remove items from other carts when clearing', async () => {
      const cart1 = await service.createCart(1);
      const cart2 = await service.createCart(2);

      await service.addItem(cart1.cartId, mockAddItemRequest);
      await service.addItem(cart2.cartId, mockAddItemRequest);

      service.clearCart(cart1.cartId);

      const updatedCart1 = service.findCartById(cart1.cartId);
      const updatedCart2 = service.findCartById(cart2.cartId);

      expect(updatedCart1?.items.length).toBe(0);
      expect(updatedCart2?.items.length).toBe(1);
    });
  });

  describe('Cart Total Calculation', () => {
    it('should calculate cart total correctly', async () => {
      const cart = await service.createCart(1);
      await service.addItem(cart.cartId, { productId: 1, quantity: 2 }); // 2 * 29.99 = 59.98

      mockProductService.getProductById.and.returnValue(of(mockProduct2));
      await service.addItem(cart.cartId, { productId: 2, quantity: 1 }); // 1 * 19.99 = 19.99

      const result = service.getCartTotal(cart.cartId);

      expect(result.itemCount).toBe(3); // 2 + 1
      expect(result.total).toBe(79.97); // 59.98 + 19.99
    });

    it('should return zero total for non-existent cart', () => {
      const result = service.getCartTotal(999);

      expect(result.itemCount).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should return zero total for empty cart', async () => {
      const cart = await service.createCart(1);
      const result = service.getCartTotal(cart.cartId);

      expect(result.itemCount).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should handle different product prices', async () => {
      const cart = await service.createCart(1);

      // Mock different products with different prices
      mockProductService.getProductById.and.callFake((id) => {
        if (id === 1) return of({ ...mockProduct, price: 10.00 });
        if (id === 2) return of({ ...mockProduct, price: 20.00 });
        return throwError(() => new Error('Product not found'));
      });

      await service.addItem(cart.cartId, { productId: 1, quantity: 3 }); // 3 * 10 = 30
      await service.addItem(cart.cartId, { productId: 2, quantity: 2 }); // 2 * 20 = 40

      const result = service.getCartTotal(cart.cartId);

      expect(result.itemCount).toBe(5);
      expect(result.total).toBe(70);
    });

    it('should handle zero price products', async () => {
      const freeProduct = { ...mockProduct, price: 0 };
      mockProductService.getProductById.and.returnValue(of(freeProduct));

      const cart = await service.createCart(1);
      await service.addItem(cart.cartId, { productId: 1, quantity: 5 });

      const result = service.getCartTotal(cart.cartId);

      expect(result.itemCount).toBe(5);
      expect(result.total).toBe(0);
    });
  });

  describe('Private Helper Methods', () => {
    it('should get all carts from localStorage', async () => {
      await service.createCart(1);
      await service.createCart(2);

      const carts = service['getAllCarts']();

      expect(carts.length).toBe(2);
      expect(carts[0].userId).toBe(1);
      expect(carts[1].userId).toBe(2);
    });

    it('should return empty array when no carts exist', () => {
      const carts = service['getAllCarts']();

      expect(carts).toEqual([]);
    });

    it('should save carts to localStorage', () => {
      const testCarts = [mockCart];
      service['saveCarts'](testCarts);

      const savedData = mockLocalStorage['vallmere_carts'];
      expect(savedData).toBeTruthy();

      const parsedData = JSON.parse(savedData);
      expect(parsedData).toEqual(testCarts);
    });

    it('should get all cart items from localStorage', async () => {
      const cart = await service.createCart(1);
      await service.addItem(cart.cartId, mockAddItemRequest);

      const items = service['getAllCartItems']();

      expect(items.length).toBe(1);
      expect(items[0].productId).toBe(mockAddItemRequest.productId);
    });

    it('should return empty array when no cart items exist', () => {
      const items = service['getAllCartItems']();

      expect(items).toEqual([]);
    });

    it('should save cart items to localStorage', () => {
      const testItems = [mockCartItem];
      service['saveCartItems'](testItems);

      const savedData = mockLocalStorage['vallmere_cart_items'];
      expect(savedData).toBeTruthy();

      const parsedData = JSON.parse(savedData);
      expect(parsedData).toEqual(testItems);
    });

    it('should get cart items for specific cart', async () => {
      const cart1 = await service.createCart(1);
      const cart2 = await service.createCart(2);

      await service.addItem(cart1.cartId, mockAddItemRequest);
      await service.addItem(cart2.cartId, mockAddItemRequest);

      const cart1Items = service['getCartItems'](cart1.cartId);
      const cart2Items = service['getCartItems'](cart2.cartId);

      expect(cart1Items.length).toBe(1);
      expect(cart2Items.length).toBe(1);
      expect(cart1Items[0].cartId).toBe(cart1.cartId);
      expect(cart2Items[0].cartId).toBe(cart2.cartId);
    });

    it('should generate next cart ID correctly', () => {
      const id1 = service['getNextCartId']();
      const id2 = service['getNextCartId']();

      expect(id1).toBe(1);
      expect(id2).toBe(2);
    });

    it('should generate next cart item ID correctly', () => {
      const id1 = service['getNextCartItemId']();
      const id2 = service['getNextCartItemId']();

      expect(id1).toBe(1);
      expect(id2).toBe(2);
    });

    it('should handle invalid counter values', () => {
      mockLocalStorage['vallmere_cart_id_counter'] = 'invalid';
      mockLocalStorage['vallmere_cart_item_id_counter'] = 'invalid';

      const cartId = service['getNextCartId']();
      const itemId = service['getNextCartItemId']();

      expect(cartId).toBe(1);
      expect(itemId).toBe(1);
    });

    it('should get product by ID via ProductService', async () => {
      const result = await service['getProductById'](1);

      expect(result).toEqual(mockProduct);
      expect(mockProductService.getProductById).toHaveBeenCalledWith(1);
    });

    it('should return null when ProductService fails', async () => {
      mockProductService.getProductById.and.returnValue(throwError(() => new Error('Service error')));
      spyOn(console, 'error');

      const result = await service['getProductById'](1);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error getting product by ID:', jasmine.any(Error));
    });

    it('should handle ProductService returning null', async () => {
      mockProductService.getProductById.and.returnValue(throwError(() => new Error('Product not found')));

      const result = await service['getProductById'](1);

      expect(result).toBeNull();
    });
  });

  describe('Utility and Debugging Methods', () => {
    it('should clear all cart data', async () => {
      // Create some test data
      await service.createCart(1);
      await service.addItem(1, mockAddItemRequest);

      service.clearAllCartData();

      expect(mockLocalStorage['vallmere_carts']).toBeUndefined();
      expect(mockLocalStorage['vallmere_cart_items']).toBeUndefined();
      expect(mockLocalStorage['vallmere_cart_id_counter']).toBeUndefined();
      expect(mockLocalStorage['vallmere_cart_item_id_counter']).toBeUndefined();
    });

    it('should export cart data correctly', async () => {
      await service.createCart(1);
      await service.addItem(1, mockAddItemRequest);

      const exportedData = service.exportCartData();
      const parsedData = JSON.parse(exportedData);

      expect(parsedData.carts).toBeTruthy();
      expect(parsedData.cartItems).toBeTruthy();
      expect(parsedData.cartIdCounter).toBeTruthy();
      expect(parsedData.cartItemIdCounter).toBeTruthy();

      expect(parsedData.carts.length).toBe(1);
      expect(parsedData.cartItems.length).toBe(1);
    });

    it('should export empty data when no carts exist', () => {
      const exportedData = service.exportCartData();
      const parsedData = JSON.parse(exportedData);

      expect(parsedData.carts).toEqual([]);
      expect(parsedData.cartItems).toEqual([]);
      expect(parsedData.cartIdCounter).toBeNull();
      expect(parsedData.cartItemIdCounter).toBeNull();
    });

    it('should format exported data with pretty printing', async () => {
      await service.createCart(1);
      const exportedData = service.exportCartData();

      // Check if it's formatted (contains newlines and spaces)
      expect(exportedData).toContain('\n');
      expect(exportedData).toContain('  '); // Indentation
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle localStorage errors gracefully', () => {
      spyOn(localStorage, 'getItem').and.throwError('Storage error');

      expect(() => service['getAllCarts']()).toThrow();
    });

    it('should handle JSON parsing errors', () => {
      mockLocalStorage['vallmere_carts'] = 'invalid json';

      expect(() => service['getAllCarts']()).toThrow();
    });

    it('should handle missing products gracefully in cart items', async () => {
      const cart = await service.createCart(1);

      // Manually add an item with invalid product reference
      const invalidItem: CartItem = {
        cartItemId: 1,
        cartId: cart.cartId,
        productId: 999,
        quantity: 1,
        product: { ...mockProduct, id: 999 }
      };

      service['saveCartItems']([invalidItem]);

      const foundCart = service.findCartById(cart.cartId);
      expect(foundCart?.items.length).toBe(1);
    });

    it('should handle negative quantities in requests', async () => {
      const cart = await service.createCart(1);

      await expectAsync(service.addItem(cart.cartId, { productId: 1, quantity: -1 }))
        .toBeRejected();
    });

    it('should handle zero quantities in requests', async () => {
      const cart = await service.createCart(1);

      await expectAsync(service.addItem(cart.cartId, { productId: 1, quantity: 0 }))
        .toBeRejected();
    });

    it('should handle very large quantities', async () => {
      const cart = await service.createCart(1);
      const largeQuantity = Number.MAX_SAFE_INTEGER;

      await expectAsync(service.addItem(cart.cartId, { productId: 1, quantity: largeQuantity }))
        .toBeRejectedWithError('Not enough stock. Available: 10');
    });

    it('should handle concurrent operations', async () => {
      const cart = await service.createCart(1);

      // Try to add the same product concurrently
      const promises = [
        service.addItem(cart.cartId, { productId: 1, quantity: 2 }),
        service.addItem(cart.cartId, { productId: 1, quantity: 3 })
      ];

      const results = await Promise.all(promises);

      // One should add new item, other should update existing
      expect(results.length).toBe(2);
      expect(results[1].quantity).toBeGreaterThan(2); // Should be updated quantity
    });

    it('should handle product with zero stock', async () => {
      const noStockProduct = { ...mockProduct, stock: 0 };
      mockProductService.getProductById.and.returnValue(of(noStockProduct));
      const cart = await service.createCart(1);

      await expectAsync(service.addItem(cart.cartId, { productId: 1, quantity: 1 }))
        .toBeRejectedWithError('Not enough stock. Available: 0');
    });

    it('should handle floating point prices correctly', async () => {
      const floatPriceProduct = { ...mockProduct, price: 10.999 };
      mockProductService.getProductById.and.returnValue(of(floatPriceProduct));

      const cart = await service.createCart(1);
      await service.addItem(cart.cartId, { productId: 1, quantity: 3 });

      const result = service.getCartTotal(cart.cartId);

      expect(result.total).toBe(32.997); // 3 * 10.999
    });
  });

  describe('Data Integrity and Consistency', () => {
    it('should maintain data consistency after multiple operations', async () => {
      // Create multiple carts with items
      const cart1 = await service.createCart(1);
      const cart2 = await service.createCart(2);

      await service.addItem(cart1.cartId, { productId: 1, quantity: 2 });
      await service.addItem(cart2.cartId, { productId: 1, quantity: 3 });

      // Verify data integrity
      const allCarts = service['getAllCarts']();
      const allItems = service['getAllCartItems']();

      expect(allCarts.length).toBe(2);
      expect(allItems.length).toBe(2);
      expect(allItems[0].cartId).toBe(cart1.cartId);
      expect(allItems[1].cartId).toBe(cart2.cartId);
    });

    it('should handle cart deletion cascade', async () => {
      const cart = await service.createCart(1);
      await service.addItem(cart.cartId, mockAddItemRequest);

      service.removeCart(cart.cartId);

      const carts = service['getAllCarts']();
      const items = service['getAllCartItems']();

      expect(carts.length).toBe(0);
      expect(items.length).toBe(0);
    });

    it('should handle user switching carts', async () => {
      // User 1 creates cart
      const cart1 = await service.createCart(1);
      await service.addItem(cart1.cartId, mockAddItemRequest);

      // User 2 creates cart
      const cart2 = await service.createCart(2);
      await service.addItem(cart2.cartId, mockAddItemRequest);

      // Verify isolation
      const user1Cart = service.findCartByUserId(1);
      const user2Cart = service.findCartByUserId(2);

      expect(user1Cart?.cartId).toBe(cart1.cartId);
      expect(user2Cart?.cartId).toBe(cart2.cartId);
      expect(user1Cart?.items.length).toBe(1);
      expect(user2Cart?.items.length).toBe(1);
    });

    it('should maintain counter consistency', async () => {
      const cart = await service.createCart(1);

      // Add multiple items
      await service.addItem(cart.cartId, { productId: 1, quantity: 1 });
      await service.addItem(cart.cartId, { productId: 2, quantity: 1 });

      // Remove one item
      const items = service['getAllCartItems']();
      service.removeItem(cart.cartId, items[0].cartItemId);

      // Add another item - should get next available ID
      await service.addItem(cart.cartId, { productId: 3, quantity: 1 });

      const finalItems = service['getAllCartItems']();
      const itemIds = finalItems.map(item => item.cartItemId);

      // Should have sequential IDs (no gaps from removal)
      expect(Math.max(...itemIds)).toBe(3);
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle large number of carts efficiently', async () => {
      const startTime = performance.now();

      // Create many carts
      const promises = Array.from({ length: 100 }, (_, i) =>
        service.createCart(i + 1)
      );

      await Promise.all(promises);

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in reasonable time

      const carts = service['getAllCarts']();
      expect(carts.length).toBe(100);
    });

    it('should handle large number of cart items efficiently', async () => {
      const cart = await service.createCart(1);

      const startTime = performance.now();

      // Add many different products
      for (let i = 1; i <= 50; i++) {
        mockProductService.getProductById.and.returnValue(of({
          ...mockProduct,
          id: i,
          stock: 100
        }));

        await service.addItem(cart.cartId, { productId: i, quantity: 1 });
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(2000); // Should be reasonably fast

      const total = service.getCartTotal(cart.cartId);
      expect(total.itemCount).toBe(50);
    });

    it('should not leak memory with multiple service instances', () => {
      const services = Array.from({ length: 100 }, () => TestBed.inject(LocalCartService));

      expect(services.length).toBe(100);
      expect(services.every(s => s instanceof LocalCartService)).toBe(true);
    });

    it('should handle rapid cart operations', async () => {
      const operations = [];

      // Create rapid operations
      for (let i = 0; i < 20; i++) {
        operations.push(service.createCart(i + 1));
      }

      const carts = await Promise.all(operations);

      expect(carts.length).toBe(20);
      expect(new Set(carts.map(c => c.cartId)).size).toBe(20); // All unique IDs
    });

    it('should efficiently calculate totals for large carts', async () => {
      const cart = await service.createCart(1);

      // Add many items
      for (let i = 0; i < 100; i++) {
        const product = { ...mockProduct, id: i + 1, price: i + 1 };
        mockProductService.getProductById.and.returnValue(of(product));

        // Manually add to avoid ProductService call overhead in test
        const items = service['getAllCartItems']();
        items.push({
          cartItemId: i + 1,
          cartId: cart.cartId,
          productId: i + 1,
          quantity: 2,
          product
        });
        service['saveCartItems'](items);
      }

      const startTime = performance.now();
      const total = service.getCartTotal(cart.cartId);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should be fast
      expect(total.itemCount).toBe(200); // 100 items * 2 quantity
    });
  });
});
