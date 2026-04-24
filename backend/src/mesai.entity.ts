import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Mesai {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tarih: string;

  @Column()
  girisSaati: string;

  @Column({ nullable: true })
  cikisSaati: string;

  @Column({ default: 0 })
  toplamCalisma: number;

  @ManyToOne(() => User, (user) => user.mesailer, { onDelete: 'CASCADE' })
  personel: User;

  @Column()
  personelId: number;
}
