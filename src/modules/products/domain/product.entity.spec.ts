import { ConflictDomainError, ValidationDomainError } from '../../../common/domain/domain-error';
import { Product } from './product.entity';

function buildProduct(overrides: Partial<Parameters<typeof Product.create>[0]> = {}): Product {
  return Product.create({
    id: 'p-1',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse',
    priceInCents: 5000,
    currency: 'COP',
    stock: 10,
    imageUrl: null,
    ...overrides,
  });
}

describe('Product', () => {
  describe('create', () => {
    it('creates a product with the given props, active by default', () => {
      const product = buildProduct();

      expect(product.name).toBe('Wireless Mouse');
      expect(product.stock).toBe(10);
      expect(product.isActive).toBe(true);
    });

    it('throws ValidationDomainError when name is empty', () => {
      expect(() => buildProduct({ name: '  ' })).toThrow(ValidationDomainError);
    });

    it('throws ValidationDomainError when price is not positive', () => {
      expect(() => buildProduct({ priceInCents: 0 })).toThrow(ValidationDomainError);
    });

    it('throws ValidationDomainError when stock is negative', () => {
      expect(() => buildProduct({ stock: -1 })).toThrow(ValidationDomainError);
    });
  });

  describe('fromPersistence', () => {
    it('rehydrates a product from stored props as-is', () => {
      const now = new Date();
      const product = Product.fromPersistence({
        id: 'p-1',
        name: 'Keyboard',
        description: null,
        priceInCents: 12000,
        currency: 'COP',
        stock: 3,
        imageUrl: null,
        isActive: false,
        createdAt: now,
        updatedAt: now,
      });

      expect(product.isActive).toBe(false);
      expect(product.stock).toBe(3);
    });
  });

  describe('hasStockFor', () => {
    it('returns true when stock covers the requested quantity', () => {
      expect(buildProduct({ stock: 5 }).hasStockFor(5)).toBe(true);
    });

    it('returns false when stock is insufficient', () => {
      expect(buildProduct({ stock: 2 }).hasStockFor(3)).toBe(false);
    });
  });

  describe('decreaseStock', () => {
    it('reduces the stock by the given quantity', () => {
      const product = buildProduct({ stock: 10 });

      product.decreaseStock(4);

      expect(product.stock).toBe(6);
    });

    it('throws ConflictDomainError when stock is insufficient', () => {
      const product = buildProduct({ stock: 1 });

      expect(() => product.decreaseStock(2)).toThrow(ConflictDomainError);
    });

    it('throws ValidationDomainError when quantity is zero or negative', () => {
      const product = buildProduct({ stock: 10 });

      expect(() => product.decreaseStock(0)).toThrow(ValidationDomainError);
      expect(() => product.decreaseStock(-1)).toThrow(ValidationDomainError);
    });
  });

  describe('increaseStock', () => {
    it('increases the stock by the given quantity', () => {
      const product = buildProduct({ stock: 5 });

      product.increaseStock(3);

      expect(product.stock).toBe(8);
    });

    it('throws ValidationDomainError when quantity is zero or negative', () => {
      const product = buildProduct();

      expect(() => product.increaseStock(0)).toThrow(ValidationDomainError);
    });
  });

  describe('setStock', () => {
    it('overwrites the stock value', () => {
      const product = buildProduct({ stock: 5 });

      product.setStock(20);

      expect(product.stock).toBe(20);
    });

    it('throws ValidationDomainError when new stock is negative', () => {
      const product = buildProduct();

      expect(() => product.setStock(-5)).toThrow(ValidationDomainError);
    });
  });

  describe('deactivate', () => {
    it('marks the product as inactive', () => {
      const product = buildProduct();

      product.deactivate();

      expect(product.isActive).toBe(false);
    });
  });

  describe('toProps', () => {
    it('returns a copy of the internal props', () => {
      const product = buildProduct();

      const props = product.toProps();

      expect(props.name).toBe('Wireless Mouse');
      expect(props.id).toBe('p-1');
    });
  });
});
