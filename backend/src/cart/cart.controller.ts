import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddCartItemDto, UpdateQuantityDto } from './dto/add-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  create(@Body() createCartDto: CreateCartDto, @GetUser() user: any) {
    return this.cartService.create(createCartDto);
  }

  @Get('my-cart')
  async getMyCart(@GetUser() user: any) {
    return this.cartService.getOrCreateCart(user.userId);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.cartService.findByUserId(+userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(+id);
  }

  @Post('add-item')
  async addItemToMyCart(
    @Body() addItemDto: AddCartItemDto,
    @GetUser() user: any,
  ) {
    return this.cartService.addItemByUserId(user.userId, addItemDto);
  }

  @Post(':id/items')
  addItem(
    @Param('id') id: string,
    @Body() addItemDto: AddCartItemDto,
  ) {
    return this.cartService.addItem(+id, addItemDto);
  }

  @Put(':id/items/:itemId/quantity')
  updateItemQuantity(
    @Param('id') cartId: string,
    @Param('itemId') itemId: string,
    @Body() updateQuantityDto: UpdateQuantityDto,
  ) {
    return this.cartService.updateItemQuantity(+cartId, +itemId, updateQuantityDto.quantity);
  }

  @Delete(':id/items/:itemId')
  removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(+id, +itemId);
  }

  @Delete(':id/clear')
  clearCart(@Param('id') id: string) {
    return this.cartService.clearCart(+id);
  }

  @Get(':id/total')
  getCartTotal(@Param('id') id: string) {
    return this.cartService.getCartTotal(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(+id);
  }
} 