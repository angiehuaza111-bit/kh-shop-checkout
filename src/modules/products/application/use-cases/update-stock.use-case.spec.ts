import { NotFoundDomainError, ValidationDomainError } from '../../../../common/domain/domain-error';
import { Product } from '../../domain/product.entity';
import { ProductRepositoryPort } from '../../domain/product-repository.port';
import { UpdateStockUseCase } from './update-stock.use-case';

function buildRepository(overrides: Partial<jest.Mocked<ProductRepositoryPort>> = {}) {
  return {
    findAllActive: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn((product) => Promise.resolve(product)),
    ...overrides,
  } as jest.Mocked<ProductRepositoryPort>;
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

describe('UpdateStockUseCase', () => {
  it('updates the stock of an existing product', async () => {
    const product = buildProduct(10);
    const repository = buildRepository({ findById: jest.fn().mockResolvedValue(product) });
    const useCase = new UpdateStockUseCase(repository);

    const result = await useCase.execute('p-1', 50);

    expect(result.stock).toBe(50);
    expect(repository.update).toHaveBeenCalledWith(product);
  });

  it('throws NotFoundDomainError when the product does not exist', async () => {
    const repository = buildRepository({ findById: jest.fn().mockResolvedValue(null) });
    const useCase = new UpdateStockUseCase(repository);

    await expect(useCase.execute('missing', 10)).rejects.toThrow(NotFoundDomainError);
  });

  it('propagates domain validation errors for an invalid stock value', async () => {
    const product = buildProduct(10);
    const repository = buildRepository({ findById: jest.fn().mockResolvedValue(product) });
    const useCase = new UpdateStockUseCase(repository);

    await expect(useCase.execute('p-1', -5)).rejects.toThrow(ValidationDomainError);
  });
});
