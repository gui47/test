
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('wallets')
@Unique('UQ_wallets_user_currency', ['userId', 'currency'])
export class WalletOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 100 })
  userId!: string;

  @Column({ type: 'char', length: 3 })
  currency!: string;

  @Column({
    name: 'balance',
    type: 'numeric',
    precision: 20,
    scale: 2,
    default: '0.00',
  })
  balance!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
