
import { describe, expect, test } from 'bun:test';

import { Wallet } from '../../src/domain/entities/wallet.entity.js';
import { Money } from '../../src/domain/value-objects/money.js';

describe('Wallet', () => {
  test('should debit balance correctly', () => {
    const wallet = Wallet.create('wallet-1', 'user-1', 'BRL');

    wallet.credit(
      Money.from({ amount: '100.00', currency: 'BRL' }),
    );

    wallet.debit(
      Money.from({ amount: '30.00', currency: 'BRL' }),
    );

    expect(wallet.balance.toJSON()).toEqual({
      amount: '70.00',
      currency: 'BRL',
    });
  });

  test('should credit balance correctly', () => {
    const wallet = Wallet.create('wallet-1', 'user-1', 'BRL');

    wallet.credit(
      Money.from({ amount: '50.00', currency: 'BRL' }),
    );

    expect(wallet.balance.toJSON()).toEqual({
      amount: '50.00',
      currency: 'BRL',
    });
  });

  test('should reject debit with insufficient balance', () => {
    const wallet = Wallet.create('wallet-1', 'user-1', 'BRL');

    expect(() =>
      wallet.debit(
        Money.from({ amount: '10.00', currency: 'BRL' }),
      ),
    ).toThrow('Insufficient wallet balance');
  });

  test('should reject zero-value debit', () => {
    const wallet = Wallet.create('wallet-1', 'user-1', 'BRL');

    expect(() => {
      wallet.debit(Money.zero('BRL'));
    }).toThrow('Amount must be greater than zero');
  });

  test('should reject zero-value credit', () => {
    const wallet = Wallet.create('wallet-1', 'user-1', 'BRL');

    expect(() => {
      wallet.credit(Money.zero('BRL'));
    }).toThrow('Amount must be greater than zero');
  });
});
