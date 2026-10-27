
import 'dotenv/config';
import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { WalletOrmEntity } from '../entities/wallet.orm-entity.js';
import { LedgerEntryOrmEntity } from '../entities/ledger-entry.orm-entity.js';
import { EventInboxOrmEntity } from '../entities/event-inbox.orm-entity.js';
import { OutboxEventOrmEntity } from '../entities/outbox-event.orm-entity.js';

import { InitialFinancialSchema1761566400000 } from './migrations/1761566400000-InitialFinancialSchema.js';
import { CreateEventInbox1793100000000 } from './migrations/1793100000000-CreateEventInbox.js';
import { CreateOutboxEvents1793103600000 } from './migrations/1793103600000-CreateOutboxEvents.js';

export const AppDataSource = new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 5433),
  username: process.env.DB_USERNAME ?? 'wagering',
  password: process.env.DB_PASSWORD ?? 'wagering_dev_password',
  database: process.env.DB_DATABASE ?? 'wagering_db',

  entities: [
    WalletOrmEntity,
    LedgerEntryOrmEntity,
    EventInboxOrmEntity,
    OutboxEventOrmEntity,
  ],

  migrations: [
    InitialFinancialSchema1761566400000,
    CreateEventInbox1793100000000,
    CreateOutboxEvents1793103600000,
  ],

  synchronize: false,
  migrationsRun: false,
  logging: true,
});
