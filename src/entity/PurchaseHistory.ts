import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'
import { itemCategory } from '../asset/items/items';

@Entity()
export class PurchaseHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("int")
  userId!: number;

  @CreateDateColumn()
  createdAt!: string;

  @Column("varchar")
  item!: string;

  @Column("varchar")
  category!: itemCategory;

  @Column("int")
  price!: number;

  @Column("int")
  expense!: string;

  @Column("int")
  leftGold!: string;
}