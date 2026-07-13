import { NotFoundDomainError } from '../../../../common/domain/domain-error';
import { Product } from '../../domain/product.entity';
import { ProductRepositoryPort } from '../../domain/product-repository.port';
import { GetProductUseCase } from './get-product.use-case';

function buildRepository(overrides: Partial<jest.Mocked<ProductRepositoryPort>> = {}) {
  return {
    findAllActive: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    ...overrides,
  } as jest.Mocked<ProductRepositoryPort>;
}

describe('GetProductUseCase', () => {
  it('returns the product when found', async () => {
    const product = Product.create({
      id: 'p-1',
      name: 'Mouse',
      description: null,
      priceInCents: 1000,
      currency: 'COP',
      stock: 5,
      imageUrl: null,
    });
    const repository = buildRepository({ findById: jest.fn().mockResolvedValue(product) });
    const useCase = new GetProductUseCase(repository);

    const result = await useCase.execute('p-1');

    expect(result).toBe(product);
  });

  it('throws NotFoundDomainError when the product does not exist', async () => {
    const repository = buildRepository({ findById: jest.fn().mockResolvedValue(null) });
    const useCase = new GetProductUseCase(repository);

    await expect(useCase.execute('missing')).rejects.toThrow(NotFoundDomainError);
  });
});
