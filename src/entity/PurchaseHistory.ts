import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'
import { ItemCategory } from '../asset/items';

@Entity()
export class PurchaseHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("bigint")
  userId!: number;

  @CreateDateColumn()
  createdAt!: string;

  @Column("varchar")
  item!: string;

  @Column("varchar")
  category!: ItemCategory;

  @Column("int")
  price!: number;

  @Column("int")
  expense!: number;

  @Column("int")
  leftGold!: number;
}