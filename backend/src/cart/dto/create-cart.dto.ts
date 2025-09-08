import { IsNumber, IsPositive } from 'class-validator';

export class CreateCartDto {
  @IsNumber()
  @IsPositive()
  userId: number;
} 