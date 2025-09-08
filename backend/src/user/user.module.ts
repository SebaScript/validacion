import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { AddressService } from './address.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Address])],
  controllers: [UserController],
  providers: [UserService, AddressService],
  exports: [UserService, AddressService],
})
export class UserModule {}
