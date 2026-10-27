
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WalletService } from './application/wallet.service.js';
import { WalletsController } from './wallets.controller.js';

import { WalletRepository } from '../../infrastructure/repositories/wallet.repository.js';

import { WalletOrmEntity } from '../../infrastructure/entities/wallet.orm-entity.js';
import { LedgerEntryOrmEntity } from '../../infrastructure/entities/ledger-entry.orm-entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalletOrmEntity,
      LedgerEntryOrmEntity,
    ]),
  ],

  controllers: [
    WalletsController,
  ],

  providers: [
    WalletService,
    WalletRepository,
  ],

  exports: [
    WalletService,
  ],
})
export class WalletsModule {}
