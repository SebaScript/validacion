import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AddressService } from './address.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly addressService: AddressService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@GetUser() user: any, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(user.userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  // Address endpoints
  @UseGuards(JwtAuthGuard)
  @Get('profile/addresses')
  getUserAddresses(@GetUser() user: any) {
    return this.addressService.findAllByUser(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/addresses')
  createAddress(@GetUser() user: any, @Body() createAddressDto: CreateAddressDto) {
    return this.addressService.create(user.userId, createAddressDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/addresses/:id')
  getAddress(@GetUser() user: any, @Param('id') id: string) {
    return this.addressService.findOne(+id, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/addresses/:id')
  updateAddress(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressService.update(+id, user.userId, updateAddressDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/addresses/:id/default')
  setDefaultAddress(@GetUser() user: any, @Param('id') id: string) {
    return this.addressService.setDefault(+id, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile/addresses/:id')
  removeAddress(@GetUser() user: any, @Param('id') id: string) {
    return this.addressService.remove(+id, user.userId);
  }
}
