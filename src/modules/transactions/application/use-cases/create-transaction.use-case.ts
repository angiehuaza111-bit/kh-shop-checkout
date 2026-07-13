import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConflictDomainError, NotFoundDomainError } from '../../../../common/domain/domain-error';
import { Product } from '../../../products/domain/product.entity';
import {
  PRODUCT_REPOSITORY,
  ProductRepositoryPort,
} from '../../../products/domain/product-repository.port';
import { PAYMENT_GATEWAY, PaymentGatewayPort } from '../../domain/payment-gateway.port';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepositoryPort,
} from '../../domain/transaction-repository.port';
import { Transaction } from '../../domain/transaction.entity';
import { ApplyChargeResultService } from '../services/apply-charge-result.service';

export interface CreateTransactionItemInput {
  productId: string;
  quantity: number;
}

export interface CreateTransactionInput {
  items: CreateTransactionItemInput[];
  customerEmail: string;
  cardToken: string;
  installments: number;
}

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepositoryPort,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(PAYMENT_GATEWAY) private readonly paymentGateway: PaymentGatewayPort,
    private readonly applyChargeResultService: ApplyChargeResultService,
  ) {}

  async execute(input: CreateTransactionInput): Promise<Transaction> {
    const products = await this.loadProducts(input.items);
    this.assertStockAvailability(products, input.items);

    let transaction = Transaction.create({
      id: randomUUID(),
      reference: `TX-${randomUUID()}`,
      currency: 'COP',
      customerEmail: input.customerEmail,
      items: input.items.map((item) => ({
        id: randomUUID(),
        productId: item.productId,
        quantity: item.quantity,
        unitPriceInCents: this.getProduct(products, item.productId).priceInCents,
      })),
    });
    transaction = await this.transactionRepository.create(transaction);

    await this.chargeAndResolve(transaction, input);

    return transaction;
  }

  private async chargeAndResolve(
    transaction: Transaction,
    input: CreateTransactionInput,
  ): Promise<void> {
    try {
      const chargeResult = await this.paymentGateway.chargeCard({
        reference: transaction.reference,
        amountInCents: transaction.amountInCents,
        currency: transaction.currency,
        customerEmail: transaction.customerEmail,
        cardToken: input.cardToken,
        installments: input.installments,
      });
      await this.applyChargeResultService.execute(transaction, chargeResult);
    } catch (error) {
      transaction.markError(
        error instanceof Error ? error.message : 'Unknown payment gateway error',
      );
      await this.transactionRepository.update(transaction);
    }
  }

  private async loadProducts(items: CreateTransactionItemInput[]): Promise<Map<string, Product>> {
    const products = new Map<string, Product>();
    for (const item of items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new NotFoundDomainError('Product', item.productId);
      }
      products.set(item.productId, product);
    }
    return products;
  }

  private assertStockAvailability(
    products: Map<string, Product>,
    items: CreateTransactionItemInput[],
  ): void {
    for (const item of items) {
      const product = this.getProduct(products, item.productId);
      if (!product.hasStockFor(item.quantity)) {
        throw new ConflictDomainError(`Insufficient stock for product "${product.name}"`);
      }
    }
  }

  private getProduct(products: Map<string, Product>, productId: string): Product {
    const product = products.get(productId);
    if (!product) {
      throw new NotFoundDomainError('Product', productId);
    }
    return product;
  }
}
