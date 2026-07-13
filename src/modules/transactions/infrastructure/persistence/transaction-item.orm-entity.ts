import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ProductOrmEntity } from '../../../products/infrastructure/persistence/product.orm-entity';
import { TransactionOrmEntity } from './transaction.orm-entity';

@Entity({ name: 'transaction_items' })
export class TransactionItemOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index('idx_transaction_items_transaction_id')
  @Column({ name: 'transaction_id', type: 'uuid' })
  transactionId!: string;

  @ManyToOne(() => TransactionOrmEntity, (transaction) => transaction.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'transaction_id' })
  transaction!: TransactionOrmEntity;

  @Index('idx_transaction_items_product_id')
  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => ProductOrmEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product!: ProductOrmEntity;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ name: 'unit_price_in_cents', type: 'integer' })
  unitPriceInCents!: number;

  @Column({ name: 'subtotal_in_cents', type: 'integer' })
  subtotalInCents!: number;
}
