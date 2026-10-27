
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DataSource, EntityManager } from 'typeorm';
import { randomUUID } from 'node:crypto';

import { Wallet } from '../../../domain/entities/wallet.entity.js';
import { LedgerEntryType } from '../../../domain/enums/ledger-entry-type.enum.js';
import { Money } from '../../../domain/value-objects/money.js';

import { WalletRepository } from '../../../infrastructure/repositories/wallet.repository.js';

import { LedgerEntryOrmEntity } from '../../../infrastructure/entities/ledger-entry.orm-entity.js';
import { EventInboxOrmEntity } from '../../../infrastructure/entities/event-inbox.orm-entity.js';
import { OutboxEventOrmEntity } from '../../../infrastructure/entities/outbox-event.orm-entity.js';

@Injectable()
export class WalletService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly walletRepository: WalletRepository,
  ) {}

  async getBalance(walletId: string) {
    const wallet = await this.dataSource.transaction(
      async (manager) =>
        this.walletRepository.findById(walletId, manager),
    );

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return {
      walletId: wallet.id,
      userId: wallet.userId,
      balance: wallet.balance.toJSON(),
    };
  }

  async processBet(
    walletId: string,
    amount: string,
    referenceId: string,
    eventId: string,
  ) {
    return this.processOperation(
      walletId,
      amount,
      referenceId,
      eventId,
      LedgerEntryType.BET,
      (wallet, money) => wallet.debit(money),
    );
  }

  async processWin(
    walletId: string,
    amount: string,
    referenceId: string,
    eventId: string,
  ) {
    return this.processOperation(
      walletId,
      amount,
      referenceId,
      eventId,
      LedgerEntryType.WIN,
      (wallet, money) => wallet.credit(money),
    );
  }

  async processLoss(
    walletId: string,
    amount: string,
    referenceId: string,
    eventId: string,
  ) {
    return this.processOperation(
      walletId,
      amount,
      referenceId,
      eventId,
      LedgerEntryType.LOSS,
      () => undefined,
    );
  }

  async processRefund(
    walletId: string,
    amount: string,
    referenceId: string,
    eventId: string,
  ) {
    return this.processOperation(
      walletId,
      amount,
      referenceId,
      eventId,
      LedgerEntryType.REFUND,
      async (wallet, money, manager) => {
        const repository =
          manager.getRepository(LedgerEntryOrmEntity);

        const originalBet = await repository.findOne({
          where: {
            walletId,
            referenceId,
            type: LedgerEntryType.BET,
          },
        });

        if (!originalBet) {
          throw new BadRequestException(
            'Original bet not found',
          );
        }

        const previousRefund = await repository.findOne({
          where: {
            walletId,
            referenceId,
            type: LedgerEntryType.REFUND,
          },
        });

        if (previousRefund) {
          throw new ConflictException(
            'Bet has already been refunded',
          );
        }

        const previousRollback = await repository.findOne({
          where: {
            walletId,
            referenceId,
            type: LedgerEntryType.ROLLBACK,
          },
        });

        if (previousRollback) {
          throw new ConflictException(
            'Bet has already been rolled back',
          );
        }

        if (originalBet.amount !== money.toJSON().amount) {
          throw new BadRequestException(
            'Refund amount must match the original bet',
          );
        }

        wallet.credit(money);
      },
    );
  }

  async processRollback(
    walletId: string,
    amount: string,
    referenceId: string,
    eventId: string,
    originalType: LedgerEntryType,
  ) {
    const reversibleTypes = [
      LedgerEntryType.BET,
      LedgerEntryType.WIN,
      LedgerEntryType.LOSS,
      LedgerEntryType.REFUND,
    ];

    if (!reversibleTypes.includes(originalType)) {
      throw new BadRequestException(
        'Invalid original transaction type for rollback',
      );
    }

    return this.processOperation(
      walletId,
      amount,
      referenceId,
      eventId,
      LedgerEntryType.ROLLBACK,
      async (wallet, money, manager) => {
        const repository =
          manager.getRepository(LedgerEntryOrmEntity);

        const originalEntry = await repository.findOne({
          where: {
            walletId,
            referenceId,
            type: originalType,
          },
        });

        if (!originalEntry) {
          throw new NotFoundException(
            'Original transaction not found',
          );
        }

        if (originalEntry.amount !== money.toJSON().amount) {
          throw new BadRequestException(
            'Rollback amount must match the original transaction',
          );
        }

        const previousRollback = await repository.findOne({
          where: {
            walletId,
            referenceId,
            type: LedgerEntryType.ROLLBACK,
          },
        });

        if (previousRollback) {
          throw new ConflictException(
            'Transaction has already been rolled back',
          );
        }

        if (originalType === LedgerEntryType.BET) {
          const previousRefund = await repository.findOne({
            where: {
              walletId,
              referenceId,
              type: LedgerEntryType.REFUND,
            },
          });

          if (previousRefund) {
            throw new ConflictException(
              'A refunded bet cannot be rolled back',
            );
          }
        }

        switch (originalType) {
          case LedgerEntryType.BET:
            wallet.credit(money);
            break;

          case LedgerEntryType.WIN:
          case LedgerEntryType.REFUND:
            wallet.debit(money);
            break;

          case LedgerEntryType.LOSS:
            break;
        }
      },
    );
  }

  private async processOperation(
    walletId: string,
    amount: string,
    referenceId: string,
    eventId: string,
    type: LedgerEntryType,
    operation: (
      wallet: Wallet,
      money: Money,
      manager: EntityManager,
    ) => Promise<void> | void,
  ) {
    if (!walletId?.trim()) {
      throw new BadRequestException('Wallet ID is required');
    }

    if (!referenceId?.trim()) {
      throw new BadRequestException('Reference ID is required');
    }

    if (!eventId?.trim()) {
      throw new BadRequestException('Event ID is required');
    }

    let money: Money;

    try {
      money = Money.from({
        amount,
        currency: 'BRL',
      });
    } catch {
      throw new BadRequestException('Invalid monetary amount');
    }

    if (money.isZero()) {
      throw new BadRequestException(
        'Amount must be greater than zero',
      );
    }

    try {
      return await this.dataSource.transaction(
        async (manager) => {
          const inboxRepository =
            manager.getRepository(EventInboxOrmEntity);

          const existingEvent = await inboxRepository.findOne({
            where: { eventId },
          });

          if (existingEvent) {
            throw new ConflictException(
              'Event has already been processed',
            );
          }

          await inboxRepository.save({
            eventId,
            eventType: type,
            status: 'PROCESSING',
            processedAt: null,
          });

          // Bloqueia a carteira durante a operação financeira.
          const wallet =
            await this.walletRepository.findByIdForUpdate(
              walletId,
              manager,
            );

          if (!wallet) {
            throw new NotFoundException('Wallet not found');
          }

          // Executa a regra financeira.
          await operation(wallet, money, manager);

          // Persiste o novo saldo.
          await this.walletRepository.save(wallet, manager);

          // Registra a movimentação no ledger.
          const ledgerRepository =
            manager.getRepository(LedgerEntryOrmEntity);

          const ledgerEntryId = randomUUID();

          await ledgerRepository.save({
            id: ledgerEntryId,
            walletId,
            referenceId,
            type,
            amount: money.toJSON().amount,
          });

          // Registra o evento na Outbox.
          // Este registro participa da mesma transação financeira.
          const outboxRepository =
            manager.getRepository(OutboxEventOrmEntity);

          await outboxRepository.save({
            id: randomUUID(),
            eventType: type,
            aggregateId: walletId,
            payload: {
              eventId,
              transactionId: ledgerEntryId,
              walletId,
              referenceId,
              transactionType: type,
              amount: money.toJSON().amount,
              currency: money.currency,
              balanceAfter: wallet.balance.toJSON().amount,
              occurredAt: new Date().toISOString(),
            },
            status: 'PENDING',
            attempts: 0,
            lastError: null,
            processedAt: null,
          });

          // Marca o evento de entrada como processado.
          await inboxRepository.update(
            { eventId },
            {
              status: 'PROCESSED',
              processedAt: new Date(),
            },
          );

          return {
            walletId,
            balance: wallet.balance.toJSON(),
            transactionType: type,
            referenceId,
            eventId,
            status: 'PROCESSED',
          };
        },
      );
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      const databaseError = error as {
        code?: string;
      };

      if (databaseError.code === '23505') {
        throw new ConflictException(
          'Transaction has already been processed',
        );
      }

      throw error;
    }
  }
}
