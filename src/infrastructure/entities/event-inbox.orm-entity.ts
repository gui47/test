
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('event_inbox')
export class EventInboxOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'event_id',
    type: 'varchar',
    length: 150,
    unique: true,
  })
  eventId!: string;

  @Column({
    name: 'event_type',
    type: 'varchar',
    length: 30,
  })
  eventType!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'PROCESSED',
  })
  status!: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @Column({
    name: 'processed_at',
    type: 'timestamptz',
    nullable: true,
  })
  processedAt!: Date | null;
}
