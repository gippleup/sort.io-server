import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn} from 'typeorm'

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
  gold!: number;

  @Column("varchar")
  items!: string;

  @Column("boolean")
  isTemp!: boolean;

  @Column("varchar")
  profileImg!: string;

  @Column("int")
  ticket!: number;

  @Column("int")
  googleId!: number;
}