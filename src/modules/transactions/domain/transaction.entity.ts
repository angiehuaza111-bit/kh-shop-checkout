import { ConflictDomainError, ValidationDomainError } from '../../../common/domain/domain-error';
import { TransactionStatus } from './transaction-status.enum';

export interface TransactionItemProps {
  id: string;
  productId: string;
  quantity: number;
  unitPriceInCents: number;
  subtotalInCents: number;
}

export interface TransactionItemInput {
  id: string;
  productId: string;
  quantity: number;
  unitPriceInCents: number;
}

export interface TransactionProps {
  id: string;
  reference: string;
  status: TransactionStatus;
  amountInCents: number;
  currency: string;
  customerEmail: string;
  gatewayTransactionId: string | null;
  cardLastFour: string | null;
  cardBrand: string | null;
  failureReason: string | null;
  items: TransactionItemProps[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionProps {
  id: string;
  reference: string;
  currency: string;
  customerEmail: string;
  items: TransactionItemInput[];
}

export class Transaction {
  private constructor(private readonly props: TransactionProps) {}

  static create(props: CreateTransactionProps): Transaction {
    if (props.items.length === 0) {
      throw new ValidationDomainError('A transaction must have at least one item');
    }
    if (!props.customerEmail || props.customerEmail.trim().length === 0) {
      throw new ValidationDomainError('Customer email is required');
    }

    const items: TransactionItemProps[] = props.items.map((item) => {
      if (item.quantity <= 0) {
        throw new ValidationDomainError('Item quantity must be greater than zero');
      }
      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPriceInCents: item.unitPriceInCents,
        subtotalInCents: item.unitPriceInCents * item.quantity,
      };
    });

    const amountInCents = items.reduce((total, item) => total + item.subtotalInCents, 0);
    const now = new Date();

    return new Transaction({
      id: props.id,
      reference: props.reference,
      status: TransactionStatus.PENDING,
      amountInCents,
      currency: props.currency,
      customerEmail: props.customerEmail,
      gatewayTransactionId: null,
      cardLastFour: null,
      cardBrand: null,
      failureReason: null,
      items,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(props: TransactionProps): Transaction {
    return new Transaction(props);
  }

  get id(): string {
    return this.props.id;
  }

  get reference(): string {
    return this.props.reference;
  }

  get status(): TransactionStatus {
    return this.props.status;
  }

  get amountInCents(): number {
    return this.props.amountInCents;
  }

  get currency(): string {
    return this.props.currency;
  }

  get customerEmail(): string {
    return this.props.customerEmail;
  }

  get gatewayTransactionId(): string | null {
    return this.props.gatewayTransactionId;
  }

  get cardLastFour(): string | null {
    return this.props.cardLastFour;
  }

  get cardBrand(): string | null {
    return this.props.cardBrand;
  }

  get failureReason(): string | null {
    return this.props.failureReason;
  }

  get items(): TransactionItemProps[] {
    return this.props.items;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isPending(): boolean {
    return this.props.status === TransactionStatus.PENDING;
  }

  attachGatewayReference(gatewayTransactionId: string): void {
    this.props.gatewayTransactionId = gatewayTransactionId;
    this.props.updatedAt = new Date();
  }

  markApproved(details: {
    gatewayTransactionId: string;
    cardLastFour: string | null;
    cardBrand: string | null;
  }): void {
    this.assertPending();
    this.props.status = TransactionStatus.APPROVED;
    this.props.gatewayTransactionId = details.gatewayTransactionId;
    this.props.cardLastFour = details.cardLastFour;
    this.props.cardBrand = details.cardBrand;
    this.props.updatedAt = new Date();
  }

  markDeclined(details: { gatewayTransactionId: string | null; failureReason: string }): void {
    this.assertPending();
    this.props.status = TransactionStatus.DECLINED;
    this.props.gatewayTransactionId = details.gatewayTransactionId;
    this.props.failureReason = details.failureReason;
    this.props.updatedAt = new Date();
  }

  markError(failureReason: string): void {
    this.assertPending();
    this.props.status = TransactionStatus.ERROR;
    this.props.failureReason = failureReason;
    this.props.updatedAt = new Date();
  }

  private assertPending(): void {
    if (this.props.status !== TransactionStatus.PENDING) {
      throw new ConflictDomainError(
        `Transaction "${this.props.reference}" is already resolved as ${this.props.status}`,
      );
    }
  }

  toProps(): TransactionProps {
    return { ...this.props, items: this.props.items.map((item) => ({ ...item })) };
  }
}
