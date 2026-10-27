import { describe, expect, test } from 'bun:test';
import { Money } from '../../src/domain/value-objects/money.js';

describe('Money', () => {
  test('should add monetary values correctly', () => {
    const first = Money.from({
      amount: '10.10',
      currency: 'BRL',
    });

    const second = Money.from({
      amount: '0.20',
      currency: 'BRL',
    });

    expect(first.add(second).toJSON()).toEqual({
      amount: '10.30',
      currency: 'BRL',
    });
  });

  test('should subtract monetary values correctly', () => {
    const first = Money.from({
      amount: '20.00',
      currency: 'BRL',
    });

    const second = Money.from({
      amount: '5.50',
      currency: 'BRL',
    });

    expect(first.subtract(second).toJSON()).toEqual({
      amount: '14.50',
      currency: 'BRL',
    });
  });

  test('should reject different currencies', () => {
    const brl = Money.from({
      amount: '10.00',
      currency: 'BRL',
    });

    const usd = Money.from({
      amount: '10.00',
      currency: 'USD',
    });

    expect(() => brl.add(usd)).toThrow('Currency mismatch');
  });

  test('should reject negative input amounts', () => {
    expect(() =>
      Money.from({
        amount: '-10.00',
        currency: 'BRL',
      }),
    ).toThrow('Invalid monetary amount');
  });
});