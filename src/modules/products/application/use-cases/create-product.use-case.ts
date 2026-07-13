import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../domain/product.entity';
import { PRODUCT_REPOSITORY, ProductRepositoryPort } from '../../domain/product-repository.port';

export interface CreateProductInput {
  name: string;
  description: string | null;
  priceInCents: number;
  currency: string;
  stock: number;
  imageUrl: string | null;
}

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepositoryPort,
  ) {}

  execute(input: CreateProductInput): Promise<Product> {
    const product = Product.create({ id: randomUUID(), ...input });
    return this.productRepository.create(product);
  }
}
