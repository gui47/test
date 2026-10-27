
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

import { LedgerEntryType } from '../../../domain/enums/ledger-entry-type.enum.js';

export class WalletOperationDto {
  @IsString()
  @Matches(/^\d+\.\d{2}$/, {
    message: 'Amount must have exactly two decimal places',
  })
  amount!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  referenceId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  eventId!: string;
}

export class RollbackDto extends WalletOperationDto {
  @IsEnum([
    LedgerEntryType.BET,
    LedgerEntryType.WIN,
    LedgerEntryType.LOSS,
    LedgerEntryType.REFUND,
  ])
  originalType!: LedgerEntryType;
}
