import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Maas {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  temelMaas: number;

  @Column({ default: 0 })
  prim: number;

  @Column({ type: 'float', default: 14 })
  sgkYuzdesi: number;

  @Column({ type: 'float', default: 20 })
  vergiYuzdesi: number;

  @Column({ type: 'float', default: 0 })
  brutMaas: number;

  @Column()
  odemeTarihi: string;

  @Column({ default: 'Beklemede' })
  durum: string;

  @ManyToOne(() => User, (user) => user.maaslar, { onDelete: 'CASCADE' })
  personel: User;

  @Column()
  personelId: number;
}
