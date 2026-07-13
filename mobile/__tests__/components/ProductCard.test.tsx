import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ProductCard } from '../../src/components/ProductCard';
import { Product } from '../../src/features/products/productsSlice';

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p-1',
    name: 'Wireless Mouse',
    description: 'A mouse',
    priceInCents: 500000,
    currency: 'COP',
    stock: 5,
    imageUrl: null,
    isActive: true,
    ...overrides,
  };
}

describe('ProductCard', () => {
  it('shows the Add button when the quantity is zero', async () => {
    const onAdd = jest.fn();
    await render(
      <ProductCard product={buildProduct()} quantity={0} onAdd={onAdd} onIncrement={jest.fn()} onDecrement={jest.fn()} />,
    );

    await fireEvent.press(screen.getByTestId('add-button-p-1'));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('shows a quantity stepper once an item has been added', async () => {
    await render(
      <ProductCard product={buildProduct()} quantity={2} onAdd={jest.fn()} onIncrement={jest.fn()} onDecrement={jest.fn()} />,
    );

    expect(screen.getByTestId('quantity-p-1').props.children).toBe(2);
  });

  it('calls onIncrement and onDecrement', async () => {
    const onIncrement = jest.fn();
    const onDecrement = jest.fn();
    await render(
      <ProductCard
        product={buildProduct()}
        quantity={1}
        onAdd={jest.fn()}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
      />,
    );

    await fireEvent.press(screen.getByTestId('increment-button-p-1'));
    await fireEvent.press(screen.getByTestId('decrement-button-p-1'));

    expect(onIncrement).toHaveBeenCalledTimes(1);
    expect(onDecrement).toHaveBeenCalledTimes(1);
  });

  it('disables the Add button when the product is out of stock', async () => {
    await render(
      <ProductCard
        product={buildProduct({ stock: 0 })}
        quantity={0}
        onAdd={jest.fn()}
        onIncrement={jest.fn()}
        onDecrement={jest.fn()}
      />,
    );

    expect(screen.getByText('Agotado')).toBeTruthy();
  });
});
