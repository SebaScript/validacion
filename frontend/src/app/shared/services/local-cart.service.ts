import { Injectable } from '@angular/core';
import { Cart, CartItem, AddCartItemRequest, CartTotal } from '../interfaces/cart.interface';
import { Product } from '../interfaces/product.interface';
import { ProductService } from './product.service';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalCartService {
  private readonly CARTS_KEY = 'vallmere_carts';
  private readonly CART_ITEMS_KEY = 'vallmere_cart_items';
  private readonly CART_ID_COUNTER_KEY = 'vallmere_cart_id_counter';
  private readonly CART_ITEM_ID_COUNTER_KEY = 'vallmere_cart_item_id_counter';

  constructor(
    private readonly productService: ProductService,
    private readonly toastr: ToastrService
  ) { }

  // Cart Management Methods
  async createCart(userId: number): Promise<Cart> {
    const carts = this.getAllCarts();
    const cartId = this.getNextCartId();

    const newCart: Cart = {
      cartId,
      userId,
      items: []
    };

    carts.push(newCart);
    this.saveCarts(carts);

    return newCart;
  }

  findCartByUserId(userId: number): Cart | null {
    const carts = this.getAllCarts();
    const cart = carts.find(cart => cart.userId === userId);

    if (cart) {
      // Load cart items
      cart.items = this.getCartItems(cart.cartId);
    }

    return cart || null;
  }

  async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = this.findCartByUserId(userId);

    cart ??= await this.createCart(userId);

    return cart;
  }

  findCartById(cartId: number): Cart | null {
    const carts = this.getAllCarts();
    const cart = carts.find(cart => cart.cartId === cartId);

    if (cart) {
      // Load cart items with product details
      cart.items = this.getCartItems(cart.cartId);
    }

    return cart || null;
  }

  // Cart Item Management Methods
  async addItem(cartId: number, addItemRequest: AddCartItemRequest): Promise<CartItem> {
    const cart = this.findCartById(cartId);
    if (!cart) {
      throw new Error(`Cart with ID ${cartId} not found`);
    }

    // Get product details
    const product = await this.getProductById(addItemRequest.productId);
    if (!product) {
      throw new Error(`Product with ID ${addItemRequest.productId} not found`);
    }

    // Check stock availability
    if (product.stock < addItemRequest.quantity) {
      throw new Error(`Not enough stock. Available: ${product.stock}`);
    }

    const cartItems = this.getAllCartItems();

    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(item =>
      item.cartId === cartId && item.productId === addItemRequest.productId
    );

    if (existingItemIndex !== -1) {
      // Update existing item
      const existingItem = cartItems[existingItemIndex];
      const totalQuantity = existingItem.quantity + addItemRequest.quantity;

      if (totalQuantity > product.stock) {
        throw new Error(`Not enough stock. Available: ${product.stock}, requested: ${totalQuantity}`);
      }

      existingItem.quantity = totalQuantity;
      this.saveCartItems(cartItems);

      return existingItem;
    } else {
      // Create new item
      const cartItemId = this.getNextCartItemId();
      const newItem: CartItem = {
        cartItemId,
        cartId,
        productId: addItemRequest.productId,
        quantity: addItemRequest.quantity,
        product
      };

      cartItems.push(newItem);
      this.saveCartItems(cartItems);

      return newItem;
    }
  }

  async addItemByUserId(userId: number, addItemRequest: AddCartItemRequest): Promise<CartItem> {
    const cart = await this.getOrCreateCart(userId);
    return this.addItem(cart.cartId, addItemRequest);
  }

  async updateItemQuantity(cartId: number, itemId: number, quantity: number): Promise<CartItem> {
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    const cartItems = this.getAllCartItems();
    const itemIndex = cartItems.findIndex(item =>
      item.cartId === cartId && item.cartItemId === itemId
    );

    if (itemIndex === -1) {
      throw new Error(`Cart item with ID ${itemId} not found in cart ${cartId}`);
    }

    const item = cartItems[itemIndex];

    // Get updated product details to check stock
    const product = await this.getProductById(item.productId);
    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }

    // Check stock availability
    if (quantity > product.stock) {
      throw new Error(`Not enough stock. Available: ${product.stock}`);
    }

    item.quantity = quantity;
    item.product = product; // Update product details

    this.saveCartItems(cartItems);

    return item;
  }

  removeItem(cartId: number, itemId: number): void {
    const cartItems = this.getAllCartItems();
    const filteredItems = cartItems.filter(item =>
      !(item.cartId === cartId && item.cartItemId === itemId)
    );

    if (filteredItems.length === cartItems.length) {
      throw new Error(`Cart item with ID ${itemId} not found in cart ${cartId}`);
    }

    this.saveCartItems(filteredItems);
  }

  clearCart(cartId: number): void {
    const cartItems = this.getAllCartItems();
    const filteredItems = cartItems.filter(item => item.cartId !== cartId);
    this.saveCartItems(filteredItems);
  }

  removeCart(cartId: number): void {
    // Remove cart
    const carts = this.getAllCarts();
    const filteredCarts = carts.filter(cart => cart.cartId !== cartId);

    if (filteredCarts.length === carts.length) {
      throw new Error(`Cart with ID ${cartId} not found`);
    }

    // Remove all cart items
    this.clearCart(cartId);

    this.saveCarts(filteredCarts);
  }

  getCartTotal(cartId: number): CartTotal {
    const cart = this.findCartById(cartId);
    if (!cart) {
      return { itemCount: 0, total: 0 };
    }

    let itemCount = 0;
    let total = 0;

    for (const item of cart.items) {
      itemCount += item.quantity;
      total += item.quantity * item.product.price;
    }

    return { itemCount, total };
  }

  // Private helper methods
  private getAllCarts(): Cart[] {
    const cartsData = localStorage.getItem(this.CARTS_KEY);
    return cartsData ? JSON.parse(cartsData) : [];
  }

  private saveCarts(carts: Cart[]): void {
    localStorage.setItem(this.CARTS_KEY, JSON.stringify(carts));
  }

  private getAllCartItems(): CartItem[] {
    const itemsData = localStorage.getItem(this.CART_ITEMS_KEY);
    return itemsData ? JSON.parse(itemsData) : [];
  }

  private saveCartItems(cartItems: CartItem[]): void {
    localStorage.setItem(this.CART_ITEMS_KEY, JSON.stringify(cartItems));
  }

  private getCartItems(cartId: number): CartItem[] {
    const allItems = this.getAllCartItems();
    return allItems.filter(item => item.cartId === cartId);
  }

  private getNextCartId(): number {
    const currentId = parseInt(localStorage.getItem(this.CART_ID_COUNTER_KEY) || '0');
    const nextId = currentId + 1;
    localStorage.setItem(this.CART_ID_COUNTER_KEY, nextId.toString());
    return nextId;
  }

  private getNextCartItemId(): number {
    const currentId = parseInt(localStorage.getItem(this.CART_ITEM_ID_COUNTER_KEY) || '0');
    const nextId = currentId + 1;
    localStorage.setItem(this.CART_ITEM_ID_COUNTER_KEY, nextId.toString());
    return nextId;
  }

  private async getProductById(productId: number): Promise<Product | null> {
    try {
      return await firstValueFrom(this.productService.getProductById(productId));
    } catch (error) {
      console.error('Error getting product by ID:', error);
      return null;
    }
  }

  // Utility methods for debugging and data management
  clearAllCartData(): void {
    localStorage.removeItem(this.CARTS_KEY);
    localStorage.removeItem(this.CART_ITEMS_KEY);
    localStorage.removeItem(this.CART_ID_COUNTER_KEY);
    localStorage.removeItem(this.CART_ITEM_ID_COUNTER_KEY);
  }

  exportCartData(): string {
    const data = {
      carts: this.getAllCarts(),
      cartItems: this.getAllCartItems(),
      cartIdCounter: localStorage.getItem(this.CART_ID_COUNTER_KEY),
      cartItemIdCounter: localStorage.getItem(this.CART_ITEM_ID_COUNTER_KEY)
    };
    return JSON.stringify(data, null, 2);
  }
}
