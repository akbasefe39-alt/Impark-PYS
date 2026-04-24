import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Zimmet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  esyaAdi: string;

  @Column()
  seriNo: string;

  @Column()
  verilisTarihi: string;

  @ManyToOne(() => User, (user) => user.zimmetler, { onDelete: 'CASCADE' })
  personel: User;

  @Column()
  personelId: number;
}
