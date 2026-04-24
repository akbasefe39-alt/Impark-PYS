import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class PerformanceReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  score: number;

  @Column()
  badge: string;

  @Column({ type: 'text' })
  aiSummary: string;

  @Column()
  date: string;

  @Column()
  evaluator: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  personel: User;
}
