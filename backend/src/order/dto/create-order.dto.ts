import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  @IsPositive()
  userId: number;

  @IsNumber()
  @IsPositive()
  totalAmount: number;

  @IsOptional()
  @IsEnum(['pending', 'shipped', 'delivered', 'cancelled'], {
    message: 'Status must be pending, shipped, delivered, or cancelled',
  })
  status?: 'pending' | 'shipped' | 'delivered' | 'cancelled';
} 