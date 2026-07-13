import { Inject, Injectable } from '@nestjs/common';
import { NotFoundDomainError } from '../../../../common/domain/domain-error';
import { Product } from '../../domain/product.entity';
import { PRODUCT_REPOSITORY, ProductRepositoryPort } from '../../domain/product-repository.port';

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundDomainError('Product', id);
    }
    return product;
  }
}
