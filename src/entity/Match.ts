import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Column("int")
  user1!: number;

  @Column("int")
  user2!: number;

  @Column("int")
  winner!: number;

  @Column("boolean")
  isDraw!: boolean;

  @Column("int")
  difficulty!: number;

  @Column("float")
  timeConsumed!: number;

  @Column("timestamp")
  createdAt!: string;
}