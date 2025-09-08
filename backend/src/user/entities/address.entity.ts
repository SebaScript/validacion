import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('address')
export class Address {
  @PrimaryGeneratedColumn('increment')
  addressId: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string; // e.g., "Home", "Work", "Main Office"

  @Column({ type: 'varchar', length: 200, nullable: false })
  street: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  state: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  zipCode: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  country: string;

  @Column({ 
    type: 'enum', 
    enum: ['shipping', 'billing', 'both'],
    default: 'both'
  })
  type: 'shipping' | 'billing' | 'both';

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @ManyToOne(() => User, user => user.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;
} 