import { Product } from '../../domain/product.entity';
import { ProductMapper } from './product.mapper';

describe('ProductMapper', () => {
  it('maps a domain product to an ORM entity and back without losing data', () => {
    const product = Product.create({
      id: 'p-1',
      name: 'Monitor',
      description: '27 inch monitor',
      priceInCents: 100000,
      currency: 'COP',
      stock: 4,
      imageUrl: 'https://example.com/monitor.png',
    });

    const orm = ProductMapper.toOrm(product);
    const roundTripped = ProductMapper.toDomain(orm);

    expect(roundTripped.toProps()).toEqual(product.toProps());
  });
});
