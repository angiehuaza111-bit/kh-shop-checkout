import { Product } from '../../domain/product.entity';
import { ProductOrmEntity } from './product.orm-entity';

export class ProductMapper {
  static toDomain(orm: ProductOrmEntity): Product {
    return Product.fromPersistence({
      id: orm.id,
      name: orm.name,
      description: orm.description,
      priceInCents: orm.priceInCents,
      currency: orm.currency,
      stock: orm.stock,
      imageUrl: orm.imageUrl,
      isActive: orm.isActive,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(product: Product): ProductOrmEntity {
    const props = product.toProps();
    const orm = new ProductOrmEntity();
    orm.id = props.id;
    orm.name = props.name;
    orm.description = props.description;
    orm.priceInCents = props.priceInCents;
    orm.currency = props.currency;
    orm.stock = props.stock;
    orm.imageUrl = props.imageUrl;
    orm.isActive = props.isActive;
    orm.createdAt = props.createdAt;
    orm.updatedAt = props.updatedAt;
    return orm;
  }
}
