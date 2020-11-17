import { PrimaryGeneratedColumn, Column, Entity, CreateDateColumn } from "typeorm";

@Entity()
export class MultiPlay {
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Column("int")
  user1!: number;

  @Column("int")
  user2!: number;

  @Column("int")
  winner!: number;

  @Column("int")
  difficulty!: number;

  @Column("float")
  timeConsumed!: number;

  @CreateDateColumn()
  createdAt!: string;
}

export default MultiPlay;