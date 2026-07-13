import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../domain/product.entity';
import { ProductRepositoryPort } from '../../domain/product-repository.port';
import { ProductMapper } from './product.mapper';
import { ProductOrmEntity } from './product.orm-entity';

@Injectable()
export class ProductRepository implements ProductRepositoryPort {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repository: Repository<ProductOrmEntity>,
  ) {}

  async findById(id: string): Promise<Product | null> {
    const orm = await this.repository.findOne({ where: { id } });
    return orm ? ProductMapper.toDomain(orm) : null;
  }

  async findAllActive(): Promise<Product[]> {
    const orms = await this.repository.find({ where: { isActive: true } });
    return orms.map(ProductMapper.toDomain);
  }

  async create(product: Product): Promise<Product> {
    const orm = await this.repository.save(ProductMapper.toOrm(product));
    return ProductMapper.toDomain(orm);
  }

  async update(product: Product): Promise<Product> {
    const orm = await this.repository.save(ProductMapper.toOrm(product));
    return ProductMapper.toDomain(orm);
  }
}
