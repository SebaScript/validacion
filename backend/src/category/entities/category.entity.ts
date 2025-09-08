import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn('increment')
  categoryId: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @OneToMany(() => Product, product => product.category)
  products: Product[];
} 