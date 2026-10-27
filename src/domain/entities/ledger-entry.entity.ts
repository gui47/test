
import { Money } from '../value-objects/money.js';
import { LedgerEntryType } from '../enums/ledger-entry-type.enum.js';

export interface LedgerEntryProps {
  id: string;
  walletId: string;
  referenceId: string;
  type: LedgerEntryType;
  amount: Money;
  createdAt?: Date;
}

export class LedgerEntry {
  private constructor(
    public readonly id: string,
    public readonly walletId: string,
    public readonly referenceId: string,
    public readonly type: LedgerEntryType,
    public readonly amount: Money,
    public readonly createdAt: Date,
  ) {}

  static create(props: LedgerEntryProps): LedgerEntry {
    if (!props.id.trim()) {
      throw new Error('Ledger entry ID is required');
    }

    if (!props.walletId.trim()) {
      throw new Error('Wallet ID is required');
    }

    if (!props.referenceId.trim()) {
      throw new Error('Reference ID is required');
    }

    if (props.amount.isZero() || props.amount.isNegative()) {
      throw new Error('Ledger amount must be positive');
    }

    return new LedgerEntry(
      props.id,
      props.walletId,
      props.referenceId,
      props.type,
      props.amount,
      props.createdAt ?? new Date(),
    );
  }
}
