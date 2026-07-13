import { Logger } from '@nestjs/common';
import { ReconcilePendingTransactionsUseCase } from '../../application/use-cases/reconcile-pending-transactions.use-case';
import { PendingTransactionsReconciliationScheduler } from './pending-transactions-reconciliation.scheduler';

describe('PendingTransactionsReconciliationScheduler', () => {
  let useCase: jest.Mocked<ReconcilePendingTransactionsUseCase>;
  let scheduler: PendingTransactionsReconciliationScheduler;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    useCase = { execute: jest.fn() } as unknown as jest.Mocked<ReconcilePendingTransactionsUseCase>;
    scheduler = new PendingTransactionsReconciliationScheduler(useCase);
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('logs a summary when at least one transaction was checked', async () => {
    useCase.execute.mockResolvedValue({ checked: 2, resolved: 1 });

    await scheduler.reconcile();

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('checked=2 resolved=1'));
  });

  it('does not log when there was nothing to check', async () => {
    useCase.execute.mockResolvedValue({ checked: 0, resolved: 0 });

    await scheduler.reconcile();

    expect(logSpy).not.toHaveBeenCalled();
  });
});
