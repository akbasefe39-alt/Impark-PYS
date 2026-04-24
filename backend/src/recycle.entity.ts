import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class RecycleItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  itemType: string;

  @Column()
  itemTitle: string;

  @Column('text')
  itemData: string;

  @Column()
  deletedAt: string;

  @Column({ nullable: true })
  deletedBy: string;
}
