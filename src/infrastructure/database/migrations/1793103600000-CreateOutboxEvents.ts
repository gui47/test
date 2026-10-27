import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm';

export class CreateOutboxEvents1793103600000
  implements MigrationInterface
{
  name = 'CreateOutboxEvents1793103600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE outbox_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        event_type VARCHAR(30) NOT NULL,

        aggregate_id UUID NOT NULL,

        payload JSONB NOT NULL,

        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

        attempts INTEGER NOT NULL DEFAULT 0,

        last_error TEXT,

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        processed_at TIMESTAMPTZ,

        CONSTRAINT chk_outbox_status
          CHECK (status IN ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED')),

        CONSTRAINT chk_outbox_attempts
          CHECK (attempts >= 0)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_outbox_status_created
      ON outbox_events (status, created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS outbox_events;
    `);
  }
}