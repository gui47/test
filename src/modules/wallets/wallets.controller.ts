
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { WalletService } from './application/wallet.service.js';
import {
  RollbackDto,
  WalletOperationDto,
} from './dto/wallet-operation.dto.js';

@Controller('wallets')
export class WalletsController {
  constructor(
    private readonly walletService: WalletService,
  ) {}

  @Get(':walletId/balance')
  async getBalance(
    @Param('walletId') walletId: string,
  ) {
    return this.walletService.getBalance(walletId);
  }

  @Post(':walletId/bets')
  async processBet(
    @Param('walletId') walletId: string,
    @Body() body: WalletOperationDto,
  ) {
    return this.walletService.processBet(
      walletId,
      body.amount,
      body.referenceId,
      body.eventId,
    );
  }

  @Post(':walletId/wins')
  async processWin(
    @Param('walletId') walletId: string,
    @Body() body: WalletOperationDto,
  ) {
    return this.walletService.processWin(
      walletId,
      body.amount,
      body.referenceId,
      body.eventId,
    );
  }

  @Post(':walletId/losses')
  async processLoss(
    @Param('walletId') walletId: string,
    @Body() body: WalletOperationDto,
  ) {
    return this.walletService.processLoss(
      walletId,
      body.amount,
      body.referenceId,
      body.eventId,
    );
  }

  @Post(':walletId/refunds')
  async processRefund(
    @Param('walletId') walletId: string,
    @Body() body: WalletOperationDto,
  ) {
    return this.walletService.processRefund(
      walletId,
      body.amount,
      body.referenceId,
      body.eventId,
    );
  }

  @Post(':walletId/rollbacks')
  async processRollback(
    @Param('walletId') walletId: string,
    @Body() body: RollbackDto,
  ) {
    return this.walletService.processRollback(
      walletId,
      body.amount,
      body.referenceId,
      body.eventId,
      body.originalType,
    );
  }
}
