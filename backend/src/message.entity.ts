import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column()
  timestamp: string;

  @Column({ default: false })
  isAi: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  sender: User;
}
