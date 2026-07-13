import { Repository } from 'typeorm';
import { Product } from '../../domain/product.entity';
import { ProductOrmEntity } from './product.orm-entity';
import { ProductRepository } from './product.repository';

function buildProduct(): Product {
  return Product.create({
    id: 'p-1',
    name: 'Headphones',
    description: null,
    priceInCents: 30000,
    currency: 'COP',
    stock: 8,
    imageUrl: null,
  });
}

describe('ProductRepository', () => {
  let typeOrmRepository: jest.Mocked<Repository<ProductOrmEntity>>;
  let repository: ProductRepository;

  beforeEach(() => {
    typeOrmRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<ProductOrmEntity>>;
    repository = new ProductRepository(typeOrmRepository);
  });

  it('findById returns null when no ORM entity is found', async () => {
    typeOrmRepository.findOne.mockResolvedValue(null);

    const result = await repository.findById('missing');

    expect(result).toBeNull();
    expect(typeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: 'missing' } });
  });

  it('findById maps the ORM entity to a domain product when found', async () => {
    const product = buildProduct();
    typeOrmRepository.findOne.mockResolvedValue(
      Object.assign(new ProductOrmEntity(), product.toProps()),
    );

    const result = await repository.findById('p-1');

    expect(result?.id).toBe('p-1');
  });

  it('findAllActive maps every ORM entity found', async () => {
    const product = buildProduct();
    typeOrmRepository.find.mockResolvedValue([
      Object.assign(new ProductOrmEntity(), product.toProps()),
    ]);

    const result = await repository.findAllActive();

    expect(result).toHaveLength(1);
    expect(typeOrmRepository.find).toHaveBeenCalledWith({ where: { isActive: true } });
  });

  it('create persists the product and returns the mapped domain entity', async () => {
    const product = buildProduct();
    typeOrmRepository.save.mockResolvedValue(
      Object.assign(new ProductOrmEntity(), product.toProps()),
    );

    const result = await repository.create(product);

    expect(result.id).toBe('p-1');
    expect(typeOrmRepository.save).toHaveBeenCalled();
  });

  it('update persists the product and returns the mapped domain entity', async () => {
    const product = buildProduct();
    product.setStock(2);
    typeOrmRepository.save.mockResolvedValue(
      Object.assign(new ProductOrmEntity(), product.toProps()),
    );

    const result = await repository.update(product);

    expect(result.stock).toBe(2);
  });
});
