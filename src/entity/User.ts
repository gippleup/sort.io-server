import {Entity, Column, PrimaryGeneratedColumn, Unique, CreateDateColumn} from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Column({
    type: "varchar",
    length: 20,
    unique: true,
  })
  name!: string;

  @CreateDateColumn()
  createdAt!: string;

  @Column("int")
  goldDeposit!: number;

  @Column("varchar")
  items!: string;

  @Column("boolean")
  isTemp!: boolean;

  @Column("varchar")
  profileImg!: string;

  @Column("int")
  leftTicket!: number;

  @Column("int")
  lastLevel!: number;
}