import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Izin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  baslangicTarihi: string;

  @Column()
  bitisTarihi: string;

  @Column({ nullable: true })
  sebep: string;

  @Column({ default: 'Beklemede' }) // Beklemede, Onaylandı, Reddedildi
  durum: string;

  // 🚀 YENİ EKLENEN: İzin Türü (Yıllık İzin, Mazeret, Hastalık vb.)
  @Column({ default: 'Yıllık İzin' })
  izinTuru: string;

  @Column({ nullable: true })
  devreYil: string;

  @Column({ type: 'int', default: 1 })
  gunSayisi: number;

  @Column({ nullable: true })
  isBaslamaTarihi: string;

  @Column({ nullable: true })
  isYeriSicilNo: string;

  @ManyToOne(() => User, (user) => user.izinler, { onDelete: 'CASCADE' })
  personel: User;
}
