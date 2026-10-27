
import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm';

export class InitialFinancialSchema1761566400000
  implements MigrationInterface
{
  name = 'InitialFinancialSchema1761566400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE ledger_entry_type AS ENUM (
        'BET',
        'WIN',
        'LOSS',
        'REFUND',
        'ROLLBACK'
      );
    `);

    await queryRunner.query(`
      CREATE TABLE wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        user_id VARCHAR(100) NOT NULL,

        currency CHAR(3) NOT NULL,

        balance NUMERIC(20, 2) NOT NULL DEFAULT 0.00,

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        CONSTRAINT chk_wallet_balance_non_negative
          CHECK (balance >= 0),

        CONSTRAINT chk_wallet_currency_format
          CHECK (currency ~ '^[A-Z]{3}$'),

        CONSTRAINT uq_wallet_user_currency
          UNIQUE (user_id, currency)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE ledger_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        wallet_id UUID NOT NULL,

        reference_id VARCHAR(150) NOT NULL,

        type ledger_entry_type NOT NULL,

        amount NUMERIC(20, 2) NOT NULL,

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        CONSTRAINT chk_ledger_amount_positive
          CHECK (amount > 0),

        CONSTRAINT fk_ledger_wallet
          FOREIGN KEY (wallet_id)
          REFERENCES wallets(id)
          ON DELETE RESTRICT,

        CONSTRAINT uq_ledger_wallet_reference_type
          UNIQUE (wallet_id, reference_id, type)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_ledger_wallet_created
      ON ledger_entries (wallet_id, created_at DESC);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_ledger_reference
      ON ledger_entries (reference_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS ledger_entries;
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS wallets;
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS ledger_entry_type;
    `);
  }
}
