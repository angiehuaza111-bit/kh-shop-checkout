import { Inject, Injectable } from '@nestjs/common';
import { ChargeResult } from '../../domain/payment-gateway.port';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepositoryPort,
} from '../../domain/transaction-repository.port';
import { Transaction } from '../../domain/transaction.entity';
import { DecreaseStockForTransactionService } from './decrease-stock-for-transaction.service';

/**
 * Applies a gateway charge result to a still-pending transaction: resolves it to
 * APPROVED/DECLINED, or just attaches the gateway reference while it stays PENDING.
 * Shared by the synchronous checkout path and the pending-transaction reconciliation job
 * so both apply the exact same resolution rules.
 */
@Injectable()
export class ApplyChargeResultService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    private readonly decreaseStockService: DecreaseStockForTransactionService,
  ) {}

  async execute(transaction: Transaction, chargeResult: ChargeResult): Promise<void> {
    if (chargeResult.status === 'APPROVED') {
      transaction.markApproved({
        gatewayTransactionId: chargeResult.gatewayTransactionId,
        cardLastFour: chargeResult.cardLastFour,
        cardBrand: chargeResult.cardBrand,
      });
      await this.transactionRepository.update(transaction);
      await this.decreaseStockService.execute(transaction);
      return;
    }

    if (chargeResult.status === 'DECLINED') {
      transaction.markDeclined({
        gatewayTransactionId: chargeResult.gatewayTransactionId,
        failureReason: chargeResult.failureReason ?? 'Payment declined',
      });
      await this.transactionRepository.update(transaction);
      return;
    }

    transaction.attachGatewayReference(chargeResult.gatewayTransactionId);
    await this.transactionRepository.update(transaction);
  }
}
