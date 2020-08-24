import { PrimaryGeneratedColumn, Column, Entity, CreateDateColumn } from "typeorm";

@Entity()
export class SinglePlay {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("int")
  userId!: number;

  @CreateDateColumn()
  createdAt!: string;

  @Column("int")
  difficulty!: number;
}