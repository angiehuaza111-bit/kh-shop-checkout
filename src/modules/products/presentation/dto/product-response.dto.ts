import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from '../../domain/product.entity';

export class ProductResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional({ nullable: true }) description: string | null;
  @ApiProperty() priceInCents: number;
  @ApiProperty() currency: string;
  @ApiProperty() stock: number;
  @ApiPropertyOptional({ nullable: true }) imageUrl: string | null;
  @ApiProperty() isActive: boolean;

  private constructor(product: Product) {
    this.id = product.id;
    this.name = product.name;
    this.description = product.description;
    this.priceInCents = product.priceInCents;
    this.currency = product.currency;
    this.stock = product.stock;
    this.imageUrl = product.imageUrl;
    this.isActive = product.isActive;
  }

  static fromDomain(product: Product): ProductResponseDto {
    return new ProductResponseDto(product);
  }
}
