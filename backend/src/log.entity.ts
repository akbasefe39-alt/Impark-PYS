import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ActivityLog {
  @PrimaryGeneratedColumn() id: number;
  @Column() islem: string;
  @Column() yapanKisi: string;
  @Column() tarih: string;

  @Column({ nullable: true })
  method: string;

  @Column({ nullable: true })
  url: string;

  @Column({ type: 'text', nullable: true })
  payload: string;

  @Column({ nullable: true })
  statusCode: number;

  @Column({ nullable: true })
  entityName: string;

  @Column({ nullable: true })
  entityId: string;

  @Column({ type: 'text', nullable: true })
  oldData: string;

  @Column({ type: 'text', nullable: true })
  newData: string;
}
