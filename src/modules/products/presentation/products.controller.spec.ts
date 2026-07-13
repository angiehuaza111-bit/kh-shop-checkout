import { CreateProductUseCase } from '../application/use-cases/create-product.use-case';
import { GetProductUseCase } from '../application/use-cases/get-product.use-case';
import { ListProductsUseCase } from '../application/use-cases/list-products.use-case';
import { UpdateStockUseCase } from '../application/use-cases/update-stock.use-case';
import { Product } from '../domain/product.entity';
import { ProductsController } from './products.controller';

function buildProduct(): Product {
  return Product.create({
    id: 'p-1',
    name: 'Mouse',
    description: null,
    priceInCents: 1000,
    currency: 'COP',
    stock: 5,
    imageUrl: null,
  });
}

describe('ProductsController', () => {
  let controller: ProductsController;
  let listProductsUseCase: jest.Mocked<ListProductsUseCase>;
  let getProductUseCase: jest.Mocked<GetProductUseCase>;
  let createProductUseCase: jest.Mocked<CreateProductUseCase>;
  let updateStockUseCase: jest.Mocked<UpdateStockUseCase>;

  beforeEach(() => {
    listProductsUseCase = { execute: jest.fn() } as unknown as jest.Mocked<ListProductsUseCase>;
    getProductUseCase = { execute: jest.fn() } as unknown as jest.Mocked<GetProductUseCase>;
    createProductUseCase = { execute: jest.fn() } as unknown as jest.Mocked<CreateProductUseCase>;
    updateStockUseCase = { execute: jest.fn() } as unknown as jest.Mocked<UpdateStockUseCase>;
    controller = new ProductsController(
      listProductsUseCase,
      getProductUseCase,
      createProductUseCase,
      updateStockUseCase,
    );
  });

  it('list returns the catalog mapped to response DTOs', async () => {
    listProductsUseCase.execute.mockResolvedValue([buildProduct()]);

    const result = await controller.list();

    expect(result).toEqual([expect.objectContaining({ id: 'p-1', name: 'Mouse' })]);
  });

  it('getById returns a single mapped product', async () => {
    getProductUseCase.execute.mockResolvedValue(buildProduct());

    const result = await controller.getById('p-1');

    expect(result.id).toBe('p-1');
    expect(getProductUseCase.execute).toHaveBeenCalledWith('p-1');
  });

  it('create maps optional fields to their domain defaults', async () => {
    createProductUseCase.execute.mockResolvedValue(buildProduct());

    await controller.create({ name: 'Mouse', priceInCents: 1000, stock: 5 });

    expect(createProductUseCase.execute).toHaveBeenCalledWith({
      name: 'Mouse',
      description: null,
      priceInCents: 1000,
      currency: 'COP',
      stock: 5,
      imageUrl: null,
    });
  });

  it('updateStock delegates to the use case with the parsed id and new stock', async () => {
    updateStockUseCase.execute.mockResolvedValue(buildProduct());

    await controller.updateStock('p-1', { stock: 42 });

    expect(updateStockUseCase.execute).toHaveBeenCalledWith('p-1', 42);
  });
});
