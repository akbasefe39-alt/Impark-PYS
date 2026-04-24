import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  baslik: string;

  @Column()
  aciklama: string;

  @Column()
  sonTarih: string;

  @Column({ default: 'Beklemede' })
  durum: string;

  @ManyToOne(() => User, (user) => user.gorevler, { onDelete: 'CASCADE' })
  personel: User;

  @Column()
  personelId: number;
}
