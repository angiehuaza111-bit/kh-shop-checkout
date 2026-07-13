import { NotFoundDomainError } from '../../../../common/domain/domain-error';
import { TransactionRepositoryPort } from '../../domain/transaction-repository.port';
import { Transaction } from '../../domain/transaction.entity';
import { GetTransactionUseCase } from './get-transaction.use-case';

function buildTransaction(): Transaction {
  return Transaction.create({
    id: 't-1',
    reference: 'REF-1',
    currency: 'COP',
    customerEmail: 'buyer@example.com',
    items: [{ id: 'i-1', productId: 'p-1', quantity: 1, unitPriceInCents: 1000 }],
  });
}

describe('GetTransactionUseCase', () => {
  it('returns the transaction when found', async () => {
    const transaction = buildTransaction();
    const repository: jest.Mocked<TransactionRepositoryPort> = {
      findById: jest.fn().mockResolvedValue(transaction),
      findByReference: jest.fn(),
      findPendingWithGatewayReference: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    const useCase = new GetTransactionUseCase(repository);

    const result = await useCase.execute('t-1');

    expect(result).toBe(transaction);
  });

  it('throws NotFoundDomainError when the transaction does not exist', async () => {
    const repository: jest.Mocked<TransactionRepositoryPort> = {
      findById: jest.fn().mockResolvedValue(null),
      findByReference: jest.fn(),
      findPendingWithGatewayReference: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    const useCase = new GetTransactionUseCase(repository);

    await expect(useCase.execute('missing')).rejects.toThrow(NotFoundDomainError);
  });
});
