import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn('increment')
  orderId: number;

  @ManyToOne(() => User, user => user.orders)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  totalAmount: number;

  @Column({ 
    type: 'enum', 
    enum: ['pending', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  })
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
} 