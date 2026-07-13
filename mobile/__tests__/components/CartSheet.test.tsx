import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { CartSheet } from '../../src/components/CartSheet';
import { CartItem } from '../../src/features/cart/cartSlice';
import { renderWithStore } from '../testUtils/renderWithStore';

const items: CartItem[] = [
  { productId: 'p-1', name: 'Camiseta Básica', priceInCents: 4900000, currency: 'COP', quantity: 2 },
];

describe('CartSheet', () => {
  it('renders cart items and the subtotal when visible', async () => {
    await renderWithStore(
      <CartSheet visible onClose={jest.fn()} items={items} onCheckout={jest.fn()} />,
      { cart: { items } },
    );

    expect(screen.getByText('Camiseta Básica')).toBeTruthy();
    expect(screen.getByTestId('quantity-p-1')).toHaveTextContent('2');
  });

  it('dispatches incrementItem/decrementItem when the quantity selector is used', async () => {
    const { store } = await renderWithStore(
      <CartSheet visible onClose={jest.fn()} items={items} onCheckout={jest.fn()} />,
      { cart: { items } },
    );

    await fireEvent.press(screen.getByTestId('increment-button-p-1'));

    expect(store.getState().cart.items[0].quantity).toBe(3);
  });

  it('calls onCheckout when "Proceed to checkout" is pressed', async () => {
    const onCheckout = jest.fn();
    await renderWithStore(
      <CartSheet visible onClose={jest.fn()} items={items} onCheckout={onCheckout} />,
      { cart: { items } },
    );

    await fireEvent.press(screen.getByTestId('go-to-checkout-button'));

    expect(onCheckout).toHaveBeenCalledTimes(1);
  });
});
