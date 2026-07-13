import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString, IsUrl, Length, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Mouse' })
  @IsString()
  @Length(1, 150)
  name!: string;

  @ApiPropertyOptional({ example: 'Ergonomic wireless mouse with USB receiver' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 5000, description: 'Unit price in cents' })
  @IsInt()
  @IsPositive()
  priceInCents!: number;

  @ApiPropertyOptional({ example: 'COP', default: 'COP' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiProperty({ example: 25 })
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiPropertyOptional({ example: 'https://example.com/products/mouse.png' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
