import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  baslik: string;

  @Column()
  miktar: number;

  @Column()
  tarih: string;

  @Column({ default: 'Beklemede' })
  durum: string;

  @ManyToOne(() => User, (user) => user.harcamalar, { onDelete: 'CASCADE' })
  personel: User;

  @Column()
  personelId: number;
}
