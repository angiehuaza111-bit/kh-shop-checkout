import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { CheckoutScreen } from '../../src/screens/CheckoutScreen';
import { renderWithStore } from '../testUtils/renderWithStore';
import { buildFakeNavigation } from '../testUtils/fakeNavigation';

const cartState = {
  items: [
    { productId: 'p-1', name: 'Wireless Mouse', priceInCents: 500000, currency: 'COP', quantity: 1 },
  ],
};

describe('CheckoutScreen', () => {
  it('renders the order summary and total', async () => {
    const navigation = buildFakeNavigation();
    await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <CheckoutScreen navigation={navigation as any} route={{ key: 'Checkout', name: 'Checkout' } as any} />,
      { cart: cartState },
    );

    expect(screen.getByTestId('checkout-screen')).toBeTruthy();
    expect(screen.getByText('Wireless Mouse')).toBeTruthy();
  });

  it('navigates to Payment when "Continue to payment" is pressed', async () => {
    const navigation = buildFakeNavigation();
    await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <CheckoutScreen navigation={navigation as any} route={{ key: 'Checkout', name: 'Checkout' } as any} />,
      { cart: cartState },
    );

    await fireEvent.press(screen.getByTestId('pay-with-card-button'));

    expect(navigation.navigate).toHaveBeenCalledWith('Payment');
  });
});
