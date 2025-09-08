import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [UserModule, ProductModule, CategoryModule],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {} 