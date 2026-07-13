import { Inject, Injectable } from '@nestjs/common';
import { NotFoundDomainError } from '../../../../common/domain/domain-error';
import {
  PRODUCT_REPOSITORY,
  ProductRepositoryPort,
} from '../../../products/domain/product-repository.port';
import { Transaction } from '../../domain/transaction.entity';

@Injectable()
export class DecreaseStockForTransactionService {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(transaction: Transaction): Promise<void> {
    for (const item of transaction.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new NotFoundDomainError('Product', item.productId);
      }
      product.decreaseStock(item.quantity);
      await this.productRepository.update(product);
    }
  }
}
