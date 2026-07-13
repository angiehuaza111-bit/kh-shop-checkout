import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateStockDto {
  @ApiProperty({ example: 100, description: 'New absolute stock value' })
  @IsInt()
  @Min(0)
  stock!: number;
}
