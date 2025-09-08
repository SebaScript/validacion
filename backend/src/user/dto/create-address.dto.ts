import { IsString, IsEnum, IsBoolean, IsOptional, MinLength } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsString()
  @MinLength(5)
  street: string;

  @IsString()
  @MinLength(2)
  city: string;

  @IsString()
  @MinLength(2)
  state: string;

  @IsString()
  @MinLength(3)
  zipCode: string;

  @IsString()
  @MinLength(2)
  country: string;

  @IsOptional()
  @IsEnum(['shipping', 'billing', 'both'], { 
    message: 'Type must be shipping, billing, or both' 
  })
  type?: 'shipping' | 'billing' | 'both';

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
} 