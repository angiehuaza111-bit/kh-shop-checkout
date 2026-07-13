import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transaction } from '../../domain/transaction.entity';
import { TransactionStatus } from '../../domain/transaction-status.enum';

class TransactionItemResponseDto {
  @ApiProperty() productId: string;
  @ApiProperty() quantity: number;
  @ApiProperty() unitPriceInCents: number;
  @ApiProperty() subtotalInCents: number;

  constructor(
    productId: string,
    quantity: number,
    unitPriceInCents: number,
    subtotalInCents: number,
  ) {
    this.productId = productId;
    this.quantity = quantity;
    this.unitPriceInCents = unitPriceInCents;
    this.subtotalInCents = subtotalInCents;
  }
}

export class TransactionResponseDto {
  @ApiProperty() id: string;
  @ApiProperty({ description: 'Public transaction number' }) reference: string;
  @ApiProperty({ enum: TransactionStatus }) status: TransactionStatus;
  @ApiProperty() amountInCents: number;
  @ApiProperty() currency: string;
  @ApiProperty() customerEmail: string;
  @ApiPropertyOptional({ nullable: true }) cardLastFour: string | null;
  @ApiPropertyOptional({ nullable: true }) cardBrand: string | null;
  @ApiPropertyOptional({ nullable: true }) failureReason: string | null;
  @ApiProperty({ type: [TransactionItemResponseDto] }) items: TransactionItemResponseDto[];
  @ApiProperty() createdAt: Date;

  private constructor(transaction: Transaction) {
    this.id = transaction.id;
    this.reference = transaction.reference;
    this.status = transaction.status;
    this.amountInCents = transaction.amountInCents;
    this.currency = transaction.currency;
    this.customerEmail = transaction.customerEmail;
    this.cardLastFour = transaction.cardLastFour;
    this.cardBrand = transaction.cardBrand;
    this.failureReason = transaction.failureReason;
    this.items = transaction.items.map(
      (item) =>
        new TransactionItemResponseDto(
          item.productId,
          item.quantity,
          item.unitPriceInCents,
          item.subtotalInCents,
        ),
    );
    this.createdAt = transaction.createdAt;
  }

  static fromDomain(transaction: Transaction): TransactionResponseDto {
    return new TransactionResponseDto(transaction);
  }
}
