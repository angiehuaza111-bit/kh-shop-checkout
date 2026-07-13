import { Product } from '../../domain/product.entity';
import { ProductRepositoryPort } from '../../domain/product-repository.port';
import { ListProductsUseCase } from './list-products.use-case';

describe('ListProductsUseCase', () => {
  it('returns all active products from the repository', async () => {
    const product = Product.create({
      id: 'p-1',
      name: 'Mouse',
      description: null,
      priceInCents: 1000,
      currency: 'COP',
      stock: 5,
      imageUrl: null,
    });
    const repository: jest.Mocked<ProductRepositoryPort> = {
      findAllActive: jest.fn().mockResolvedValue([product]),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    const useCase = new ListProductsUseCase(repository);

    const result = await useCase.execute();

    expect(result).toEqual([product]);
    expect(repository.findAllActive).toHaveBeenCalledTimes(1);
  });
});
