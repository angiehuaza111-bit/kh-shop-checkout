import { CreateTransactionUseCase } from '../application/use-cases/create-transaction.use-case';
import { GetTransactionUseCase } from '../application/use-cases/get-transaction.use-case';
import { Transaction } from '../domain/transaction.entity';
import { TransactionsController } from './transactions.controller';

function buildTransaction(): Transaction {
  return Transaction.create({
    id: 't-1',
    reference: 'REF-1',
    currency: 'COP',
    customerEmail: 'buyer@example.com',
    items: [{ id: 'i-1', productId: 'p-1', quantity: 1, unitPriceInCents: 1000 }],
  });
}

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let createTransactionUseCase: jest.Mocked<CreateTransactionUseCase>;
  let getTransactionUseCase: jest.Mocked<GetTransactionUseCase>;

  beforeEach(() => {
    createTransactionUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateTransactionUseCase>;
    getTransactionUseCase = { execute: jest.fn() } as unknown as jest.Mocked<GetTransactionUseCase>;
    controller = new TransactionsController(createTransactionUseCase, getTransactionUseCase);
  });

  it('create defaults installments to 1 and maps the result to a response DTO', async () => {
    createTransactionUseCase.execute.mockResolvedValue(buildTransaction());

    const result = await controller.create({
      items: [{ productId: 'p-1', quantity: 1 }],
      customerEmail: 'buyer@example.com',
      cardToken: 'tok_1',
    });

    expect(createTransactionUseCase.execute).toHaveBeenCalledWith({
      items: [{ productId: 'p-1', quantity: 1 }],
      customerEmail: 'buyer@example.com',
      cardToken: 'tok_1',
      installments: 1,
    });
    expect(result.reference).toBe('REF-1');
  });

  it('getById delegates to the use case and maps the response', async () => {
    getTransactionUseCase.execute.mockResolvedValue(buildTransaction());

    const result = await controller.getById('t-1');

    expect(getTransactionUseCase.execute).toHaveBeenCalledWith('t-1');
    expect(result.id).toBe('t-1');
  });
});
