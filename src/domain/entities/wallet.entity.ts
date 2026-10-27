
import { Money } from '../value-objects/money.js';

export interface WalletProps {
  id: string;
  userId: string;
  balance: Money;
}

export class Wallet {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    private currentBalance: Money,
  ) {}

  static create(
    id: string,
    userId: string,
    currency: string,
  ): Wallet {
    return new Wallet(
      id,
      userId,
      Money.zero(currency),
    );
  }

  static restore(props: WalletProps): Wallet {
    return new Wallet(
      props.id,
      props.userId,
      props.balance,
    );
  }

  get balance(): Money {
    return this.currentBalance;
  }

  debit(amount: Money): void {
    if (amount.isZero()) {
      throw new Error('Amount must be greater than zero');
    }

    if (amount.isNegative()) {
      throw new Error('Amount must be positive');
    }

    if (this.currentBalance.isLessThan(amount)) {
      throw new Error('Insufficient wallet balance');
    }

    this.currentBalance = this.currentBalance.subtract(amount);
  }

  credit(amount: Money): void {
    if (amount.isZero()) {
      throw new Error('Amount must be greater than zero');
    }

    if (amount.isNegative()) {
      throw new Error('Amount must be positive');
    }

    this.currentBalance = this.currentBalance.add(amount);
  }
}
