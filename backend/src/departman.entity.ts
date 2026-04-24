import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Departman {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ad: string;

  @OneToMany(() => User, (user) => user.departman)
  personeller: User[];
}
