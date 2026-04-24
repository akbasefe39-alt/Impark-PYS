import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dosyaAdi: string;

  @Column()
  dosyaTuru: string;

  @Column({ type: 'text', nullable: true })
  dosyaIcerik: string;

  @Column()
  yuklemeTarihi: string;

  @ManyToOne(() => User, (user) => user.belgeler, { onDelete: 'CASCADE' })
  personel: User;

  @Column()
  personelId: number;
}
