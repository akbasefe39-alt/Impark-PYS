import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Duyuru {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  baslik: string;

  @Column({ type: 'text' })
  icerik: string;

  @Column()
  tarih: string;

  @Column({ nullable: true })
  yapanKisi: string; // Duyuruyu yapan yöneticinin ismi

  @ManyToMany(() => User)
  @JoinTable()
  okuyanlar: User[];
}
