import { Inject, Injectable, Logger } from '@nestjs/common';
import { PAYMENT_GATEWAY, PaymentGatewayPort } from '../../domain/payment-gateway.port';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepositoryPort,
} from '../../domain/transaction-repository.port';
import { Transaction } from '../../domain/transaction.entity';
import { ApplyChargeResultService } from '../services/apply-charge-result.service';

export interface ReconciliationSummary {
  checked: number;
  resolved: number;
}

/**
 * Fallback for when the gateway's webhook is never delivered (no reachable public
 * endpoint, dropped delivery, etc.): periodically re-checks any transaction still
 * PENDING against the gateway's own status and resolves it if the gateway has moved on.
 */
@Injectable()
export class ReconcilePendingTransactionsUseCase {
  private readonly logger = new Logger(ReconcilePendingTransactionsUseCase.name);

  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(PAYMENT_GATEWAY) private readonly paymentGateway: PaymentGatewayPort,
    private readonly applyChargeResultService: ApplyChargeResultService,
  ) {}

  async execute(): Promise<ReconciliationSummary> {
    const pendingTransactions = await this.transactionRepository.findPendingWithGatewayReference();

    let resolved = 0;
    for (const transaction of pendingTransactions) {
      if (await this.reconcileOne(transaction)) {
        resolved += 1;
      }
    }

    return { checked: pendingTransactions.length, resolved };
  }

  private async reconcileOne(transaction: Transaction): Promise<boolean> {
    try {
      const chargeResult = await this.paymentGateway.checkStatus(
        transaction.gatewayTransactionId as string,
      );
      if (chargeResult.status === 'PENDING') {
        return false;
      }
      await this.applyChargeResultService.execute(transaction, chargeResult);
      return true;
    } catch (error) {
      this.logger.warn(
        `Failed to reconcile transaction ${transaction.reference}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return false;
    }
  }
}
