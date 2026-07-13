import { ConflictDomainError, NotFoundDomainError } from '../../../../common/domain/domain-error';
import { Product } from '../../../products/domain/product.entity';
import { ProductRepositoryPort } from '../../../products/domain/product-repository.port';
import { ChargeResult, PaymentGatewayPort } from '../../domain/payment-gateway.port';
import { TransactionRepositoryPort } from '../../domain/transaction-repository.port';
import { TransactionStatus } from '../../domain/transaction-status.enum';
import { ApplyChargeResultService } from '../services/apply-charge-result.service';
import { DecreaseStockForTransactionService } from '../services/decrease-stock-for-transaction.service';
import { CreateTransactionUseCase } from './create-transaction.use-case';

function buildProduct(
  overrides: Partial<{ id: string; stock: number; priceInCents: number }> = {},
) {
  return Product.create({
    id: overrides.id ?? 'p-1',
    name: 'Mouse',
    description: null,
    priceInCents: overrides.priceInCents ?? 1000,
    currency: 'COP',
    stock: overrides.stock ?? 10,
    imageUrl: null,
  });
}

describe('CreateTransactionUseCase', () => {
  let productRepository: jest.Mocked<ProductRepositoryPort>;
  let transactionRepository: jest.Mocked<TransactionRepositoryPort>;
  let paymentGateway: jest.Mocked<PaymentGatewayPort>;
  let decreaseStockService: jest.Mocked<DecreaseStockForTransactionService>;
  let useCase: CreateTransactionUseCase;

  const baseInput = {
    items: [{ productId: 'p-1', quantity: 2 }],
    customerEmail: 'buyer@example.com',
    cardToken: 'tok_test_123',
    installments: 1,
  };

  beforeEach(() => {
    productRepository = {
      findAllActive: jest.fn(),
      findById: jest.fn().mockResolvedValue(buildProduct()),
      create: jest.fn(),
      update: jest.fn(),
    };
    transactionRepository = {
      findById: jest.fn(),
      findByReference: jest.fn(),
      findPendingWithGatewayReference: jest.fn(),
      create: jest.fn((transaction) => Promise.resolve(transaction)),
      update: jest.fn((transaction) => Promise.resolve(transaction)),
    };
    paymentGateway = { chargeCard: jest.fn(), checkStatus: jest.fn() };
    decreaseStockService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<DecreaseStockForTransactionService>;
    const applyChargeResultService = new ApplyChargeResultService(
      transactionRepository,
      decreaseStockService,
    );
    useCase = new CreateTransactionUseCase(
      productRepository,
      transactionRepository,
      paymentGateway,
      applyChargeResultService,
    );
  });

  it('creates an approved transaction and decreases stock', async () => {
    const chargeResult: ChargeResult = {
      gatewayTransactionId: 'gw-1',
      status: 'APPROVED',
      cardLastFour: '4242',
      cardBrand: 'VISA',
      failureReason: null,
    };
    paymentGateway.chargeCard.mockResolvedValue(chargeResult);

    const transaction = await useCase.execute(baseInput);

    expect(transaction.status).toBe(TransactionStatus.APPROVED);
    expect(transactionRepository.create).toHaveBeenCalledTimes(1);
    expect(decreaseStockService.execute).toHaveBeenCalledWith(transaction);
  });

  it('creates a declined transaction without decreasing stock', async () => {
    paymentGateway.chargeCard.mockResolvedValue({
      gatewayTransactionId: 'gw-1',
      status: 'DECLINED',
      cardLastFour: null,
      cardBrand: null,
      failureReason: 'Insufficient funds',
    });

    const transaction = await useCase.execute(baseInput);

    expect(transaction.status).toBe(TransactionStatus.DECLINED);
    expect(transaction.failureReason).toBe('Insufficient funds');
    expect(decreaseStockService.execute).not.toHaveBeenCalled();
  });

  it('leaves the transaction pending and attaches the gateway reference for async resolutions', async () => {
    paymentGateway.chargeCard.mockResolvedValue({
      gatewayTransactionId: 'gw-async-1',
      status: 'PENDING',
      cardLastFour: null,
      cardBrand: null,
      failureReason: null,
    });

    const transaction = await useCase.execute(baseInput);

    expect(transaction.status).toBe(TransactionStatus.PENDING);
    expect(transaction.gatewayTransactionId).toBe('gw-async-1');
  });

  it('marks the transaction as error when the gateway call throws', async () => {
    paymentGateway.chargeCard.mockRejectedValue(new Error('network timeout'));

    const transaction = await useCase.execute(baseInput);

    expect(transaction.status).toBe(TransactionStatus.ERROR);
    expect(transaction.failureReason).toBe('network timeout');
  });

  it('throws ConflictDomainError when stock is insufficient, without creating a transaction', async () => {
    productRepository.findById.mockResolvedValue(buildProduct({ stock: 1 }));

    await expect(useCase.execute(baseInput)).rejects.toThrow(ConflictDomainError);
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });

  it('throws NotFoundDomainError when a product does not exist', async () => {
    productRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(baseInput)).rejects.toThrow(NotFoundDomainError);
  });
});
