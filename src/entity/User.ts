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

  @Column({
    type: "int",
    default: 500,
  })
  gold!: number;

  @Column("boolean")
  isTemp!: boolean;

  @Column("varchar")
  profileImg!: string;

  @Column({
    type: "int",
    default: 3,
  })
  ticket!: number;

  @Column("varchar")
  googleId!: string;
}