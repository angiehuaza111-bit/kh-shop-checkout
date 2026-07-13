import { Logger } from '@nestjs/common';
import { PaymentGatewayPort } from '../../domain/payment-gateway.port';
import { TransactionRepositoryPort } from '../../domain/transaction-repository.port';
import { Transaction } from '../../domain/transaction.entity';
import { ApplyChargeResultService } from '../services/apply-charge-result.service';
import { ReconcilePendingTransactionsUseCase } from './reconcile-pending-transactions.use-case';

function buildPendingTransaction(gatewayTransactionId = 'gw-1'): Transaction {
  const transaction = Transaction.create({
    id: 't-1',
    reference: 'REF-1',
    currency: 'COP',
    customerEmail: 'buyer@example.com',
    items: [{ id: 'i-1', productId: 'p-1', quantity: 1, unitPriceInCents: 1000 }],
  });
  transaction.attachGatewayReference(gatewayTransactionId);
  return transaction;
}

describe('ReconcilePendingTransactionsUseCase', () => {
  let transactionRepository: jest.Mocked<TransactionRepositoryPort>;
  let paymentGateway: jest.Mocked<PaymentGatewayPort>;
  let applyChargeResultService: jest.Mocked<ApplyChargeResultService>;
  let useCase: ReconcilePendingTransactionsUseCase;

  beforeEach(() => {
    transactionRepository = {
      findById: jest.fn(),
      findByReference: jest.fn(),
      findPendingWithGatewayReference: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
    };
    paymentGateway = { chargeCard: jest.fn(), checkStatus: jest.fn() };
    applyChargeResultService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ApplyChargeResultService>;
    useCase = new ReconcilePendingTransactionsUseCase(
      transactionRepository,
      paymentGateway,
      applyChargeResultService,
    );
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  it('returns zero checked/resolved when there are no pending transactions', async () => {
    const result = await useCase.execute();

    expect(result).toEqual({ checked: 0, resolved: 0 });
  });

  it('resolves a transaction whose gateway status is no longer PENDING', async () => {
    const transaction = buildPendingTransaction();
    transactionRepository.findPendingWithGatewayReference.mockResolvedValue([transaction]);
    paymentGateway.checkStatus.mockResolvedValue({
      gatewayTransactionId: 'gw-1',
      status: 'APPROVED',
      cardLastFour: '4242',
      cardBrand: 'VISA',
      failureReason: null,
    });

    const result = await useCase.execute();

    expect(result).toEqual({ checked: 1, resolved: 1 });
    expect(applyChargeResultService.execute).toHaveBeenCalledWith(
      transaction,
      expect.objectContaining({ status: 'APPROVED' }),
    );
  });

  it('leaves a transaction alone when the gateway still reports PENDING', async () => {
    const transaction = buildPendingTransaction();
    transactionRepository.findPendingWithGatewayReference.mockResolvedValue([transaction]);
    paymentGateway.checkStatus.mockResolvedValue({
      gatewayTransactionId: 'gw-1',
      status: 'PENDING',
      cardLastFour: null,
      cardBrand: null,
      failureReason: null,
    });

    const result = await useCase.execute();

    expect(result).toEqual({ checked: 1, resolved: 0 });
    expect(applyChargeResultService.execute).not.toHaveBeenCalled();
  });

  it('continues processing other transactions when one gateway check fails', async () => {
    const failing = buildPendingTransaction('gw-1');
    const succeeding = buildPendingTransaction('gw-2');
    transactionRepository.findPendingWithGatewayReference.mockResolvedValue([failing, succeeding]);
    paymentGateway.checkStatus
      .mockRejectedValueOnce(new Error('network timeout'))
      .mockResolvedValueOnce({
        gatewayTransactionId: 'gw-2',
        status: 'DECLINED',
        cardLastFour: null,
        cardBrand: null,
        failureReason: 'Card expired',
      });

    const result = await useCase.execute();

    expect(result).toEqual({ checked: 2, resolved: 1 });
  });

  it('does not fail the batch when applying an already-resolved transaction throws', async () => {
    const transaction = buildPendingTransaction();
    transaction.markApproved({ gatewayTransactionId: 'gw-1', cardLastFour: null, cardBrand: null });
    transactionRepository.findPendingWithGatewayReference.mockResolvedValue([transaction]);
    paymentGateway.checkStatus.mockResolvedValue({
      gatewayTransactionId: 'gw-1',
      status: 'APPROVED',
      cardLastFour: null,
      cardBrand: null,
      failureReason: null,
    });
    applyChargeResultService.execute.mockRejectedValue(new Error('already resolved'));

    const result = await useCase.execute();

    expect(result.resolved).toBe(0);
  });
});
