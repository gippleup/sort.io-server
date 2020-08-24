import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";

@Entity()
export class SinglePlay {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("int")
  userId!: number;

  @Column("timestamp")
  createdAt!: string;

  @Column("int")
  difficulty!: number;
}