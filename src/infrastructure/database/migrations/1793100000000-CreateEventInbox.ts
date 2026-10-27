
import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm';

export class CreateEventInbox1793100000000
  implements MigrationInterface
{
  name = 'CreateEventInbox1793100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE event_inbox (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        event_id VARCHAR(150) NOT NULL,

        event_type VARCHAR(30) NOT NULL,

        status VARCHAR(20) NOT NULL DEFAULT 'PROCESSED',

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        processed_at TIMESTAMPTZ,

        CONSTRAINT uq_event_inbox_event_id
          UNIQUE (event_id),

        CONSTRAINT chk_event_inbox_status
          CHECK (status IN ('PROCESSING', 'PROCESSED', 'FAILED'))
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_event_inbox_created_at
      ON event_inbox (created_at DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS event_inbox;
    `);
  }
}
