
import 'dotenv/config';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HealthController } from './modules/health/health.controller.js';
import { WalletsModule } from './modules/wallets/wallets.module.js';
import { QueueModule } from './infrastructure/queue/queue.module.js';

import { WalletOrmEntity } from './infrastructure/entities/wallet.orm-entity.js';
import { LedgerEntryOrmEntity } from './infrastructure/entities/ledger-entry.orm-entity.js';
import { EventInboxOrmEntity } from './infrastructure/entities/event-inbox.orm-entity.js';
import { OutboxEventOrmEntity } from './infrastructure/entities/outbox-event.orm-entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DB_HOST') ?? '127.0.0.1',
        port: Number(configService.get<string>('DB_PORT') ?? 5433),
        username: configService.get<string>('DB_USERNAME') ?? 'wagering',
        password: configService.get<string>('DB_PASSWORD') ?? 'wagering_dev_password',
        database: configService.get<string>('DB_DATABASE') ?? 'wagering_db',
        entities: [
          WalletOrmEntity,
          LedgerEntryOrmEntity,
          EventInboxOrmEntity,
          OutboxEventOrmEntity,
        ],
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    WalletsModule,
    QueueModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
