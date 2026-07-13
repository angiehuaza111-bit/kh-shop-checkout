import {
  NotFoundDomainError,
  UnauthorizedDomainError,
} from '../../../../common/domain/domain-error';
import { TransactionRepositoryPort } from '../../domain/transaction-repository.port';
import { Transaction } from '../../domain/transaction.entity';
import { WebhookEventRepositoryPort } from '../../domain/webhook-event-repository.port';
import { WebhookSignatureVerifierPort } from '../../domain/webhook-signature-verifier.port';
import { DecreaseStockForTransactionService } from '../services/decrease-stock-for-transaction.service';
import {
  HandlePaymentWebhookUseCase,
  WebhookNotification,
} from './handle-payment-webhook.use-case';

function buildTransaction(): Transaction {
  return Transaction.create({
    id: 't-1',
    reference: 'REF-1',
    currency: 'COP',
    customerEmail: 'buyer@example.com',
    items: [{ id: 'i-1', productId: 'p-1', quantity: 1, unitPriceInCents: 1000 }],
  });
}

function buildNotification(overrides: Partial<WebhookNotification> = {}): WebhookNotification {
  return {
    providerEventId: 'evt-1',
    reference: 'REF-1',
    status: 'APPROVED',
    gatewayTransactionId: 'gw-1',
    cardLastFour: '4242',
    cardBrand: 'VISA',
    failureReason: null,
    rawPayload: {},
    ...overrides,
  };
}

describe('HandlePaymentWebhookUseCase', () => {
  let signatureVerifier: jest.Mocked<WebhookSignatureVerifierPort>;
  let webhookEventRepository: jest.Mocked<WebhookEventRepositoryPort>;
  let transactionRepository: jest.Mocked<TransactionRepositoryPort>;
  let decreaseStockService: jest.Mocked<DecreaseStockForTransactionService>;
  let useCase: HandlePaymentWebhookUseCase;

  beforeEach(() => {
    signatureVerifier = { verify: jest.fn().mockReturnValue(true) };
    webhookEventRepository = {
      existsByProviderEventId: jest.fn().mockResolvedValue(false),
      create: jest.fn((event) => Promise.resolve(event)),
      update: jest.fn((event) => Promise.resolve(event)),
    };
    transactionRepository = {
      findById: jest.fn(),
      findByReference: jest.fn().mockResolvedValue(buildTransaction()),
      findPendingWithGatewayReference: jest.fn(),
      create: jest.fn(),
      update: jest.fn((transaction) => Promise.resolve(transaction)),
    };
    decreaseStockService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<DecreaseStockForTransactionService>;
    useCase = new HandlePaymentWebhookUseCase(
      signatureVerifier,
      webhookEventRepository,
      transactionRepository,
      decreaseStockService,
    );
  });

  it('throws UnauthorizedDomainError when the signature is invalid', async () => {
    signatureVerifier.verify.mockReturnValue(false);

    await expect(
      useCase.execute({ rawPayload: {}, notification: buildNotification() }),
    ).rejects.toThrow(UnauthorizedDomainError);
    expect(webhookEventRepository.create).not.toHaveBeenCalled();
  });

  it('is a no-op when the event was already processed', async () => {
    webhookEventRepository.existsByProviderEventId.mockResolvedValue(true);

    await useCase.execute({
      rawPayload: {},
      notification: buildNotification(),
    });

    expect(webhookEventRepository.create).not.toHaveBeenCalled();
    expect(transactionRepository.findByReference).not.toHaveBeenCalled();
  });

  it('approves the transaction and decreases stock on an APPROVED notification', async () => {
    await useCase.execute({
      rawPayload: {},
      notification: buildNotification({ status: 'APPROVED' }),
    });

    expect(decreaseStockService.execute).toHaveBeenCalled();
    expect(webhookEventRepository.update).toHaveBeenCalled();
  });

  it('declines the transaction on a DECLINED notification', async () => {
    await useCase.execute({
      rawPayload: {},
      notification: buildNotification({ status: 'DECLINED', failureReason: 'Card expired' }),
    });

    expect(decreaseStockService.execute).not.toHaveBeenCalled();
  });

  it('throws NotFoundDomainError when the referenced transaction does not exist', async () => {
    transactionRepository.findByReference.mockResolvedValue(null);

    await expect(
      useCase.execute({ rawPayload: {}, notification: buildNotification() }),
    ).rejects.toThrow(NotFoundDomainError);
  });

  it('is idempotent when the transaction is already resolved', async () => {
    const resolved = buildTransaction();
    resolved.markApproved({ gatewayTransactionId: 'gw-0', cardLastFour: null, cardBrand: null });
    transactionRepository.findByReference.mockResolvedValue(resolved);

    await useCase.execute({
      rawPayload: {},
      notification: buildNotification(),
    });

    expect(decreaseStockService.execute).not.toHaveBeenCalled();
    expect(webhookEventRepository.update).toHaveBeenCalled();
  });
});
