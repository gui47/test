
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { LedgerEntryType } from '../../domain/enums/ledger-entry-type.enum.js';

@Entity('ledger_entries')
@Index('IDX_ledger_wallet_created', ['walletId', 'createdAt'])
@Index('IDX_ledger_reference', ['referenceId'])
export class LedgerEntryOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'wallet_id', type: 'uuid' })
  walletId!: string;

  @Column({ name: 'reference_id', type: 'varchar', length: 150 })
  referenceId!: string;

  @Column({
    type: 'enum',
    enum: LedgerEntryType,
    enumName: 'ledger_entry_type',
  })
  type!: LedgerEntryType;

  @Column({
    type: 'numeric',
    precision: 20,
    scale: 2,
  })
  amount!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
