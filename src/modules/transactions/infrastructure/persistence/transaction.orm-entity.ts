import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionStatus } from '../../domain/transaction-status.enum';
import { TransactionItemOrmEntity } from './transaction-item.orm-entity';

@Entity({ name: 'transactions' })
export class TransactionOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index('idx_transactions_reference', { unique: true })
  @Column({ type: 'varchar', length: 64, unique: true })
  reference!: string;

  @Index('idx_transactions_status')
  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status!: TransactionStatus;

  @Column({ name: 'amount_in_cents', type: 'integer' })
  amountInCents!: number;

  @Column({ type: 'varchar', length: 3 })
  currency!: string;

  @Index('idx_transactions_customer_email')
  @Column({ name: 'customer_email', type: 'varchar', length: 255 })
  customerEmail!: string;

  @Column({ name: 'gateway_transaction_id', type: 'varchar', length: 100, nullable: true })
  gatewayTransactionId!: string | null;

  @Column({ name: 'card_last_four', type: 'varchar', length: 4, nullable: true })
  cardLastFour!: string | null;

  @Column({ name: 'card_brand', type: 'varchar', length: 20, nullable: true })
  cardBrand!: string | null;

  @Column({ name: 'failure_reason', type: 'varchar', length: 255, nullable: true })
  failureReason!: string | null;

  @OneToMany(() => TransactionItemOrmEntity, (item) => item.transaction, {
    cascade: ['insert'],
    eager: true,
  })
  items!: TransactionItemOrmEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
