import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateProductUseCase } from '../application/use-cases/create-product.use-case';
import { GetProductUseCase } from '../application/use-cases/get-product.use-case';
import { ListProductsUseCase } from '../application/use-cases/list-products.use-case';
import { UpdateStockUseCase } from '../application/use-cases/update-stock.use-case';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { RolesGuard } from '../../auth/presentation/guards/roles.guard';
import { Role } from '../../auth/domain/role.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateStockUseCase: UpdateStockUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List the active product catalog (public)' })
  async list(): Promise<ProductResponseDto[]> {
    const products = await this.listProductsUseCase.execute();
    return products.map(ProductResponseDto.fromDomain);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by id (public)' })
  async getById(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponseDto> {
    const product = await this.getProductUseCase.execute(id);
    return ProductResponseDto.fromDomain(product);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product (admin only)' })
  async create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.createProductUseCase.execute({
      name: dto.name,
      description: dto.description ?? null,
      priceInCents: dto.priceInCents,
      currency: dto.currency ?? 'COP',
      stock: dto.stock,
      imageUrl: dto.imageUrl ?? null,
    });
    return ProductResponseDto.fromDomain(product);
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adjust the stock of a product (admin only)' })
  async updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStockDto,
  ): Promise<ProductResponseDto> {
    const product = await this.updateStockUseCase.execute(id, dto.stock);
    return ProductResponseDto.fromDomain(product);
  }
}
