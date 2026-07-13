import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { ReconcilePendingTransactionsUseCase } from '../../application/use-cases/reconcile-pending-transactions.use-case';

const RECONCILE_PENDING_INTERVAL_MS = Number(process.env.RECONCILE_PENDING_INTERVAL_MS ?? 60000);

/**
 * Runs on a fixed interval (not @Cron) so it self-adjusts to whatever
 * RECONCILE_PENDING_INTERVAL_MS is set to without needing a cron expression.
 */
@Injectable()
export class PendingTransactionsReconciliationScheduler {
  private readonly logger = new Logger(PendingTransactionsReconciliationScheduler.name);

  constructor(
    private readonly reconcilePendingTransactionsUseCase: ReconcilePendingTransactionsUseCase,
  ) {}

  @Interval(RECONCILE_PENDING_INTERVAL_MS)
  async reconcile(): Promise<void> {
    const summary = await this.reconcilePendingTransactionsUseCase.execute();
    if (summary.checked > 0) {
      this.logger.log(
        `Pending transaction reconciliation: checked=${summary.checked} resolved=${summary.resolved}`,
      );
    }
  }
}
