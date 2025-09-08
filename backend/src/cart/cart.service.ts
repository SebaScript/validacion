import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { ProductService } from '../product/product.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    
    private readonly productService: ProductService,
  ) {}

  async create(createCartDto: CreateCartDto): Promise<Cart> {
    const cart = this.cartRepository.create(createCartDto);
    return this.cartRepository.save(cart);
  }

  async findByUserId(userId: number): Promise<Cart | null> {
    return await this.cartRepository.findOne({
      where: { userId: userId },
      relations: ['items', 'items.product'],
    });
  }

  async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.findByUserId(userId);
    
    if (!cart) {
      cart = await this.create({ userId });
    }
    
    return cart;
  }

  async findOne(id: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { cartId: id },
      relations: ['items', 'items.product'],
    });
    
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }
    
    return cart;
  }

  async addItem(cartId: number, addItemDto: AddCartItemDto): Promise<CartItem> {
    const cart = await this.findOne(cartId);
    const product = await this.productService.findOne(addItemDto.productId);
    
    // Check if product has enough stock
    if (product.stock < addItemDto.quantity) {
      throw new BadRequestException(`Not enough stock. Available: ${product.stock}`);
    }
    
    // Check if item already exists in cart
    const existingItem = await this.cartItemRepository.findOne({
      where: {
        cartId: cartId,
        productId: addItemDto.productId,
      },
      relations: ['product'],
    });
    
    if (existingItem) {
      // Check total quantity doesn't exceed stock
      const totalQuantity = existingItem.quantity + addItemDto.quantity;
      if (totalQuantity > product.stock) {
        throw new BadRequestException(`Not enough stock. Available: ${product.stock}, requested: ${totalQuantity}`);
      }
      
      // Update quantity
      existingItem.quantity = totalQuantity;
      return this.cartItemRepository.save(existingItem);
    }
    
    // Create new item
    const newItem = this.cartItemRepository.create({
      cartId: cartId,
      productId: addItemDto.productId,
      quantity: addItemDto.quantity,
    });
    
    return this.cartItemRepository.save(newItem);
  }

  async addItemByUserId(userId: number, addItemDto: AddCartItemDto): Promise<CartItem> {
    const cart = await this.getOrCreateCart(userId);
    return this.addItem(cart.cartId, addItemDto);
  }

  async updateItemQuantity(cartId: number, itemId: number, quantity: number): Promise<CartItem> {
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    const item = await this.cartItemRepository.findOne({
      where: {
        cartId: cartId,
        cartItemId: itemId,
      },
      relations: ['product'],
    });

    if (!item) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found in cart ${cartId}`);
    }

    // Check stock availability
    if (quantity > item.product.stock) {
      throw new BadRequestException(`Not enough stock. Available: ${item.product.stock}`);
    }

    item.quantity = quantity;
    return this.cartItemRepository.save(item);
  }

  async removeItem(cartId: number, itemId: number): Promise<void> {
    const result = await this.cartItemRepository.delete({
      cartId: cartId,
      cartItemId: itemId,
    });
    
    if (result.affected === 0) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found in cart ${cartId}`);
    }
  }

  async clearCart(cartId: number): Promise<void> {
    await this.cartItemRepository.delete({
      cartId: cartId,
    });
  }

  async remove(id: number): Promise<void> {
    const result = await this.cartRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }
  }

  async getCartTotal(cartId: number): Promise<{ itemCount: number; total: number }> {
    const cart = await this.findOne(cartId);
    
    let itemCount = 0;
    let total = 0;
    
    for (const item of cart.items) {
      itemCount += item.quantity;
      total += item.quantity * item.product.price;
    }
    
    return { itemCount, total };
  }
} 