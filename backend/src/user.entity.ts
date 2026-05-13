import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Departman } from './departman.entity';
import { Izin } from './izin.entity';
import { Mesai } from './mesai.entity';
import { Zimmet } from './zimmet.entity';
import { Task } from './task.entity';
import { Expense } from './expense.entity';
import { UserDocument } from './document.entity';
import { Maas } from './maas.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: 'personel' })
  role: string;

  @Column({ default: true })
  canViewDashboard: boolean;

  @Column({ default: false })
  canManagePersonnel: boolean;

  @Column({ default: false })
  canManageFinance: boolean;

  @Column({ default: false })
  canApproveLeaves: boolean;

  @Column({ default: false })
  canManageInventory: boolean;

  @Column({ default: false })
  canViewLogs: boolean;

  @Column({ nullable: true })
  unvan: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ nullable: true })
  iseGirisTarihi: string;

  @Column({ type: 'float', default: 8 })
  normalCalismaSaati: number;

  @Column({ type: 'float', default: 0 })
  saatlikUcret: number;

  @Column({ type: 'float', default: 0 })
  gunlukUcret: number;

  @Column({ nullable: true })
  tcKimlikNo: string;

  @Column({ nullable: true })
  telefon: string;

  @Column({ type: 'int', default: 0 })
  performansPuani: number;

  @Column({ nullable: true })
  performansRozeti: string;

  @Column({ nullable: true })
  performansDegerlendirmesi: string;

  @Column({ nullable: true })
  dogumTarihi: string;

  @Column({ nullable: true })
  kanGrubu: string;

  @Column({ nullable: true })
  medeniHal: string;

  @Column({ nullable: true })
  cinsiyet: string;

  @Column({ nullable: true })
  acilDurumKisisi: string;

  @Column({ nullable: true })
  acilDurumTelefonu: string;

  @Column({ nullable: true })
  mezuniyet: string;

  @Column({ nullable: true })
  adres: string;

  @Column({ type: 'text', nullable: true })
  dashboardLayout: string;

  @Column({ type: 'text', nullable: true })
  homeLayout: string;

  @Column({ type: 'text', nullable: true })
  personalNotes: string;

  @Column({ nullable: true })
  sgkNo: string;

  @Column({ nullable: true })
  vergiNo: string;

  @Column({ nullable: true })
  iban: string;

  @Column({ nullable: true })
  ehliyetSinifi: string;

  @Column({ nullable: true })
  askerlikDurumu: string;

  @Column({ nullable: true })
  sozlesmeTipi: string;

  @Column({ nullable: true })
  uyruk: string;

  @Column({ nullable: true })
  istenAyrilisTarihi: string;

  @Column({ type: 'integer', default: 14 })
  toplamIzinHakki: number;

  @ManyToOne(() => Departman, (dep) => dep.personeller, {
    onDelete: 'SET NULL',
  })
  departman: Departman;

  @OneToMany(() => Izin, (izin) => izin.personel)
  izinler: Izin[];

  @OneToMany(() => Mesai, (mesai) => mesai.personel)
  mesailer: Mesai[];

  @OneToMany(() => Zimmet, (zimmet) => zimmet.personel)
  zimmetler: Zimmet[];

  @OneToMany(() => Task, (task) => task.personel)
  gorevler: Task[];

  @OneToMany(() => Expense, (expense) => expense.personel)
  harcamalar: Expense[];

  @OneToMany(() => UserDocument, (doc) => doc.personel)
  belgeler: UserDocument[];

  // 🚀 EKSİK OLAN İLİŞKİ BURAYA EKLENDİ (Hata artık yok!)
  @OneToMany(() => Maas, (maas) => maas.personel)
  maaslar: Maas[];

  // 🔐 GÜVENLİK: MFA Alanları
  @Column({ default: false })
  mfaEnabled: boolean;

  @Column({ default: false })
  mustChangePassword: boolean;

  @Column({ nullable: true })
  @Exclude()
  mfaCode: string;

  @Column({ type: 'datetime', nullable: true })
  @Exclude()
  mfaCodeExpires: Date;
}
