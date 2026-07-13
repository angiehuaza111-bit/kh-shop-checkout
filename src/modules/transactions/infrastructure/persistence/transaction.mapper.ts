import { Transaction, TransactionItemProps } from '../../domain/transaction.entity';
import { TransactionItemOrmEntity } from './transaction-item.orm-entity';
import { TransactionOrmEntity } from './transaction.orm-entity';

export class TransactionMapper {
  static toDomain(orm: TransactionOrmEntity): Transaction {
    const items: TransactionItemProps[] = orm.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPriceInCents: item.unitPriceInCents,
      subtotalInCents: item.subtotalInCents,
    }));

    return Transaction.fromPersistence({
      id: orm.id,
      reference: orm.reference,
      status: orm.status,
      amountInCents: orm.amountInCents,
      currency: orm.currency,
      customerEmail: orm.customerEmail,
      gatewayTransactionId: orm.gatewayTransactionId,
      cardLastFour: orm.cardLastFour,
      cardBrand: orm.cardBrand,
      failureReason: orm.failureReason,
      items,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(transaction: Transaction): TransactionOrmEntity {
    const props = transaction.toProps();
    const orm = new TransactionOrmEntity();
    orm.id = props.id;
    orm.reference = props.reference;
    orm.status = props.status;
    orm.amountInCents = props.amountInCents;
    orm.currency = props.currency;
    orm.customerEmail = props.customerEmail;
    orm.gatewayTransactionId = props.gatewayTransactionId;
    orm.cardLastFour = props.cardLastFour;
    orm.cardBrand = props.cardBrand;
    orm.failureReason = props.failureReason;
    orm.createdAt = props.createdAt;
    orm.updatedAt = props.updatedAt;
    orm.items = props.items.map((item) => {
      const itemOrm = new TransactionItemOrmEntity();
      itemOrm.id = item.id;
      itemOrm.transactionId = props.id;
      itemOrm.productId = item.productId;
      itemOrm.quantity = item.quantity;
      itemOrm.unitPriceInCents = item.unitPriceInCents;
      itemOrm.subtotalInCents = item.subtotalInCents;
      return itemOrm;
    });
    return orm;
  }
}
