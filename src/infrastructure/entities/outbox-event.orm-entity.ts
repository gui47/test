import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('outbox_events')
@Index('IDX_outbox_status_created', ['status', 'createdAt'])
export class OutboxEventOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'event_type',
    type: 'varchar',
    length: 30,
  })
  eventType!: string;

  @Column({
    name: 'aggregate_id',
    type: 'uuid',
  })
  aggregateId!: string;

  @Column({
    type: 'jsonb',
  })
  payload!: Record<string, unknown>;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'PENDING',
  })
  status!: string;

  @Column({
    type: 'integer',
    default: 0,
  })
  attempts!: number;

  @Column({
    name: 'last_error',
    type: 'text',
    nullable: true,
  })
  lastError!: string | null;

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