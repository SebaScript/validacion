import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn('increment')
  productId: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ type: 'int', default: 0, nullable: false })
  stock: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string;

  @Column({ type: 'json', nullable: true })
  carouselImages: string[];

  @ManyToOne(() => Category, category => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: false })
  categoryId: number;

  @OneToMany(() => CartItem, cartItem => cartItem.product)
  cartItems: CartItem[];
} 