import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(userId: number, createAddressDto: CreateAddressDto): Promise<Address> {
    // If this is set as default, unset other default addresses of the same type
    if (createAddressDto.isDefault) {
      await this.unsetDefaultAddresses(userId, createAddressDto.type || 'both');
    }

    const address = this.addressRepository.create({
      ...createAddressDto,
      userId,
      type: createAddressDto.type || 'both',
      isDefault: createAddressDto.isDefault || false,
    });

    return this.addressRepository.save(address);
  }

  async findAllByUser(userId: number): Promise<Address[]> {
    return this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', addressId: 'ASC' }
    });
  }

  async findOne(id: number, userId: number): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { addressId: id, userId },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    return address;
  }

  async update(id: number, userId: number, updateAddressDto: UpdateAddressDto): Promise<Address> {
    const address = await this.findOne(id, userId);

    // If this is set as default, unset other default addresses of the same type
    if (updateAddressDto.isDefault) {
      const type = updateAddressDto.type || address.type;
      await this.unsetDefaultAddresses(userId, type, id);
    }

    Object.assign(address, updateAddressDto);
    return this.addressRepository.save(address);
  }

  async remove(id: number, userId: number): Promise<void> {
    const address = await this.findOne(id, userId);
    
    // Check if user has at least one address remaining
    const userAddresses = await this.findAllByUser(userId);
    if (userAddresses.length === 1) {
      throw new BadRequestException('Cannot delete the last address. User must have at least one address.');
    }

    await this.addressRepository.remove(address);
  }

  async setDefault(id: number, userId: number): Promise<Address> {
    const address = await this.findOne(id, userId);
    
    // Unset other default addresses of the same type
    await this.unsetDefaultAddresses(userId, address.type, id);
    
    address.isDefault = true;
    return this.addressRepository.save(address);
  }

  private async unsetDefaultAddresses(userId: number, type: string, excludeId?: number): Promise<void> {
    const query = this.addressRepository
      .createQueryBuilder()
      .update(Address)
      .set({ isDefault: false })
      .where('userId = :userId', { userId })
      .andWhere('isDefault = true');

    if (type === 'both') {
      // If type is 'both', unset all default addresses
    } else {
      // If type is specific, only unset defaults of the same type or 'both'
      query.andWhere('(type = :type OR type = :both)', { type, both: 'both' });
    }

    if (excludeId) {
      query.andWhere('addressId != :excludeId', { excludeId });
    }

    await query.execute();
  }
} 