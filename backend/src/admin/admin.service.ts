import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { OrderService } from '../order/order.service';
import { ProductService } from '../product/product.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
  ) {}

  async getDashboardStats() {
    const users = await this.userService.findAll();
    const orders = await this.orderService.findAll();
    const products = await this.productService.findAll();

    return {
      totalUsers: users.length,
      totalOrders: orders.length,
      totalProducts: products.length,
      recentOrders: orders.slice(-5),
      usersByRole: {
        admin: users.filter(user => user.role === 'admin').length,
        client: users.filter(user => user.role === 'client').length,
      }
    };
  }

  async getAllUsers() {
    const users = await this.userService.findAll();
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  async getAllOrders() {
    return this.orderService.findAll();
  }

  async getAllProducts() {
    return this.productService.findAll();
  }
} 