import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { Wallet } from '../../domain/entities/wallet.entity.js';
import { Money } from '../../domain/value-objects/money.js';
import { WalletOrmEntity } from '../entities/wallet.orm-entity.js';

@Injectable()
export class WalletRepository {
  async findById(
    id: string,
    manager: EntityManager,
  ): Promise<Wallet | null> {
    const repository = manager.getRepository(WalletOrmEntity);

    const wallet = await repository.findOne({
      where: { id },
    });

    if (!wallet) {
      return null;
    }

    return this.toDomain(wallet);
  }

  async findByIdForUpdate(
    id: string,
    manager: EntityManager,
  ): Promise<Wallet | null> {
    const repository = manager.getRepository(WalletOrmEntity);

    const wallet = await repository.findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });

    if (!wallet) {
      return null;
    }

    return this.toDomain(wallet);
  }

  async save(
    wallet: Wallet,
    manager: EntityManager,
  ): Promise<void> {
    const repository = manager.getRepository(WalletOrmEntity);

    await repository.save({
      id: wallet.id,
      userId: wallet.userId,
      currency: wallet.balance.currency,
      balance: wallet.balance.toJSON().amount,
    });
  }

  private toDomain(entity: WalletOrmEntity): Wallet {
    return Wallet.restore({
      id: entity.id,
      userId: entity.userId,
      balance: Money.from({
        amount: entity.balance,
        currency: entity.currency.trim(),
      }),
    });
  }
}