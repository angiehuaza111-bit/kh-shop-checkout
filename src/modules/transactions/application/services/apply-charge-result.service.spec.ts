import { ChargeResult } from '../../domain/payment-gateway.port';
import { TransactionRepositoryPort } from '../../domain/transaction-repository.port';
import { Transaction } from '../../domain/transaction.entity';
import { TransactionStatus } from '../../domain/transaction-status.enum';
import { DecreaseStockForTransactionService } from './decrease-stock-for-transaction.service';
import { ApplyChargeResultService } from './apply-charge-result.service';

function buildTransaction(): Transaction {
  return Transaction.create({
    id: 't-1',
    reference: 'REF-1',
    currency: 'COP',
    customerEmail: 'buyer@example.com',
    items: [{ id: 'i-1', productId: 'p-1', quantity: 1, unitPriceInCents: 1000 }],
  });
}

describe('ApplyChargeResultService', () => {
  let transactionRepository: jest.Mocked<TransactionRepositoryPort>;
  let decreaseStockService: jest.Mocked<DecreaseStockForTransactionService>;
  let service: ApplyChargeResultService;

  beforeEach(() => {
    transactionRepository = {
      findById: jest.fn(),
      findByReference: jest.fn(),
      findPendingWithGatewayReference: jest.fn(),
      create: jest.fn(),
      update: jest.fn((transaction) => Promise.resolve(transaction)),
    };
    decreaseStockService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<DecreaseStockForTransactionService>;
    service = new ApplyChargeResultService(transactionRepository, decreaseStockService);
  });

  it('resolves an APPROVED result and decreases stock', async () => {
    const transaction = buildTransaction();
    const chargeResult: ChargeResult = {
      gatewayTransactionId: 'gw-1',
      status: 'APPROVED',
      cardLastFour: '4242',
      cardBrand: 'VISA',
      failureReason: null,
    };

    await service.execute(transaction, chargeResult);

    expect(transaction.status).toBe(TransactionStatus.APPROVED);
    expect(transactionRepository.update).toHaveBeenCalledWith(transaction);
    expect(decreaseStockService.execute).toHaveBeenCalledWith(transaction);
  });

  it('resolves a DECLINED result without decreasing stock', async () => {
    const transaction = buildTransaction();
    const chargeResult: ChargeResult = {
      gatewayTransactionId: 'gw-1',
      status: 'DECLINED',
      cardLastFour: null,
      cardBrand: null,
      failureReason: 'Insufficient funds',
    };

    await service.execute(transaction, chargeResult);

    expect(transaction.status).toBe(TransactionStatus.DECLINED);
    expect(transaction.failureReason).toBe('Insufficient funds');
    expect(decreaseStockService.execute).not.toHaveBeenCalled();
  });

  it('defaults the failure reason when the gateway does not provide one', async () => {
    const transaction = buildTransaction();

    await service.execute(transaction, {
      gatewayTransactionId: 'gw-1',
      status: 'DECLINED',
      cardLastFour: null,
      cardBrand: null,
      failureReason: null,
    });

    expect(transaction.failureReason).toBe('Payment declined');
  });

  it('attaches the gateway reference and stays PENDING for an async result', async () => {
    const transaction = buildTransaction();

    await service.execute(transaction, {
      gatewayTransactionId: 'gw-async-1',
      status: 'PENDING',
      cardLastFour: null,
      cardBrand: null,
      failureReason: null,
    });

    expect(transaction.status).toBe(TransactionStatus.PENDING);
    expect(transaction.gatewayTransactionId).toBe('gw-async-1');
    expect(transactionRepository.update).toHaveBeenCalledWith(transaction);
  });
});
