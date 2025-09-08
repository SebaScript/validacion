import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard(@GetUser() user: any) {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  getAllUsers(@GetUser() user: any) {
    return this.adminService.getAllUsers();
  }

  @Get('orders')
  getAllOrders(@GetUser() user: any) {
    return this.adminService.getAllOrders();
  }

  @Get('products')
  getAllProducts(@GetUser() user: any) {
    return this.adminService.getAllProducts();
  }
} 