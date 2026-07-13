import { ConflictDomainError, ValidationDomainError } from '../../../common/domain/domain-error';

export interface ProductProps {
  id: string;
  name: string;
  description: string | null;
  priceInCents: number;
  currency: string;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductProps {
  id: string;
  name: string;
  description: string | null;
  priceInCents: number;
  currency: string;
  stock: number;
  imageUrl: string | null;
}

export class Product {
  private constructor(private readonly props: ProductProps) {}

  static create(props: CreateProductProps): Product {
    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationDomainError('Product name must not be empty');
    }
    if (props.priceInCents <= 0) {
      throw new ValidationDomainError('Product price must be greater than zero');
    }
    if (props.stock < 0) {
      throw new ValidationDomainError('Product stock cannot be negative');
    }

    const now = new Date();
    return new Product({ ...props, isActive: true, createdAt: now, updatedAt: now });
  }

  static fromPersistence(props: ProductProps): Product {
    return new Product(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  get priceInCents(): number {
    return this.props.priceInCents;
  }

  get currency(): string {
    return this.props.currency;
  }

  get stock(): number {
    return this.props.stock;
  }

  get imageUrl(): string | null {
    return this.props.imageUrl;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  hasStockFor(quantity: number): boolean {
    return this.props.stock >= quantity;
  }

  decreaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new ValidationDomainError('Quantity to decrease must be greater than zero');
    }
    if (!this.hasStockFor(quantity)) {
      throw new ConflictDomainError(`Insufficient stock for product "${this.props.name}"`);
    }
    this.props.stock -= quantity;
    this.props.updatedAt = new Date();
  }

  increaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new ValidationDomainError('Quantity to increase must be greater than zero');
    }
    this.props.stock += quantity;
    this.props.updatedAt = new Date();
  }

  setStock(newStock: number): void {
    if (newStock < 0) {
      throw new ValidationDomainError('Product stock cannot be negative');
    }
    this.props.stock = newStock;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  toProps(): ProductProps {
    return { ...this.props };
  }
}
