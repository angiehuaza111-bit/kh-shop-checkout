import { Repository } from 'typeorm';
import { Transaction } from '../../domain/transaction.entity';
import { TransactionMapper } from './transaction.mapper';
import { TransactionOrmEntity } from './transaction.orm-entity';
import { TransactionRepository } from './transaction.repository';

function buildTransaction(): Transaction {
  return Transaction.create({
    id: 't-1',
    reference: 'REF-1',
    currency: 'COP',
    customerEmail: 'buyer@example.com',
    items: [{ id: 'i-1', productId: 'p-1', quantity: 1, unitPriceInCents: 1000 }],
  });
}

describe('TransactionRepository', () => {
  let typeOrmRepository: jest.Mocked<Repository<TransactionOrmEntity>>;
  let repository: TransactionRepository;

  beforeEach(() => {
    typeOrmRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<TransactionOrmEntity>>;
    repository = new TransactionRepository(typeOrmRepository);
  });

  it('findById returns null when not found', async () => {
    typeOrmRepository.findOne.mockResolvedValue(null);

    expect(await repository.findById('missing')).toBeNull();
  });

  it('findById maps the found ORM entity', async () => {
    const orm = TransactionMapper.toOrm(buildTransaction());
    typeOrmRepository.findOne.mockResolvedValue(orm);

    const result = await repository.findById('t-1');

    expect(result?.reference).toBe('REF-1');
  });

  it('findByReference queries by the reference field', async () => {
    typeOrmRepository.findOne.mockResolvedValue(null);

    await repository.findByReference('REF-1');

    expect(typeOrmRepository.findOne).toHaveBeenCalledWith({ where: { reference: 'REF-1' } });
  });

  it('findPendingWithGatewayReference maps every matching ORM entity', async () => {
    const orm = TransactionMapper.toOrm(buildTransaction());
    typeOrmRepository.find.mockResolvedValue([orm]);

    const result = await repository.findPendingWithGatewayReference();

    expect(result).toHaveLength(1);
    expect(typeOrmRepository.find).toHaveBeenCalled();
  });

  it('create persists and returns the mapped domain transaction', async () => {
    const orm = TransactionMapper.toOrm(buildTransaction());
    typeOrmRepository.save.mockResolvedValue(orm);

    const result = await repository.create(buildTransaction());

    expect(result.id).toBe('t-1');
  });

  it('update persists and returns the mapped domain transaction', async () => {
    const transaction = buildTransaction();
    transaction.markApproved({ gatewayTransactionId: 'gw-1', cardLastFour: null, cardBrand: null });
    typeOrmRepository.save.mockResolvedValue(TransactionMapper.toOrm(transaction));

    const result = await repository.update(transaction);

    expect(result.status).toBe('APPROVED');
  });
});
