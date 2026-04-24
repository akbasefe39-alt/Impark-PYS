import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class ChecklistItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  baslik: string;

  @Column({ default: false })
  tamamlandi: boolean;

  @Column() // ONBOARDING or OFFBOARDING
  tip: string;

  @Column()
  tarih: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  personel: User;

  @Column()
  personelId: number;
}
