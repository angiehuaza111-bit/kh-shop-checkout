import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { GetProductUseCase } from './application/use-cases/get-product.use-case';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';
import { UpdateStockUseCase } from './application/use-cases/update-stock.use-case';
import { PRODUCT_REPOSITORY } from './domain/product-repository.port';
import { ProductOrmEntity } from './infrastructure/persistence/product.orm-entity';
import { ProductRepository } from './infrastructure/persistence/product.repository';
import { ProductsController } from './presentation/products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductOrmEntity])],
  controllers: [ProductsController],
  providers: [
    { provide: PRODUCT_REPOSITORY, useClass: ProductRepository },
    ListProductsUseCase,
    GetProductUseCase,
    CreateProductUseCase,
    UpdateStockUseCase,
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductsModule {}
