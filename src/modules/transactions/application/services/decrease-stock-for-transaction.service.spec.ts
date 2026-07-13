import { NotFoundDomainError } from '../../../../common/domain/domain-error';
import { Product } from '../../../products/domain/product.entity';
import { ProductRepositoryPort } from '../../../products/domain/product-repository.port';
import { Transaction } from '../../domain/transaction.entity';
import { DecreaseStockForTransactionService } from './decrease-stock-for-transaction.service';

function buildTransaction(): Transaction {
  return Transaction.create({
    id: 't-1',
    reference: 'REF-1',
    currency: 'COP',
    customerEmail: 'buyer@example.com',
    items: [{ id: 'i-1', productId: 'p-1', quantity: 3, unitPriceInCents: 1000 }],
  });
}

function buildProduct(stock = 10): Product {
  return Product.create({
    id: 'p-1',
    name: 'Mouse',
    description: null,
    priceInCents: 1000,
    currency: 'COP',
    stock,
    imageUrl: null,
  });
}

describe('DecreaseStockForTransactionService', () => {
  it('decreases the stock of every product in the transaction', async () => {
    const product = buildProduct(10);
    const productRepository: jest.Mocked<ProductRepositoryPort> = {
      findAllActive: jest.fn(),
      findById: jest.fn().mockResolvedValue(product),
      create: jest.fn(),
      update: jest.fn(),
    };
    const service = new DecreaseStockForTransactionService(productRepository);

    await service.execute(buildTransaction());

    expect(product.stock).toBe(7);
    expect(productRepository.update).toHaveBeenCalledWith(product);
  });

  it('throws NotFoundDomainError when a product no longer exists', async () => {
    const productRepository: jest.Mocked<ProductRepositoryPort> = {
      findAllActive: jest.fn(),
      findById: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
    };
    const service = new DecreaseStockForTransactionService(productRepository);

    await expect(service.execute(buildTransaction())).rejects.toThrow(NotFoundDomainError);
  });
});
