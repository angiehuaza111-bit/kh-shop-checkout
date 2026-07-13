import { ProductRepositoryPort } from '../../domain/product-repository.port';
import { CreateProductUseCase } from './create-product.use-case';

function buildRepository(overrides: Partial<jest.Mocked<ProductRepositoryPort>> = {}) {
  return {
    findAllActive: jest.fn(),
    findById: jest.fn(),
    create: jest.fn((product) => Promise.resolve(product)),
    update: jest.fn(),
    ...overrides,
  } as jest.Mocked<ProductRepositoryPort>;
}

describe('CreateProductUseCase', () => {
  it('creates and persists a new product', async () => {
    const repository = buildRepository();
    const useCase = new CreateProductUseCase(repository);

    const result = await useCase.execute({
      name: 'Keyboard',
      description: 'Mechanical keyboard',
      priceInCents: 25000,
      currency: 'COP',
      stock: 15,
      imageUrl: null,
    });

    expect(result.name).toBe('Keyboard');
    expect(result.stock).toBe(15);
    expect(repository.create).toHaveBeenCalledWith(result);
  });
});
