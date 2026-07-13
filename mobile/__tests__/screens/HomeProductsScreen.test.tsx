import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { HomeProductsScreen } from '../../src/screens/HomeProductsScreen';
import { Product } from '../../src/features/products/productsSlice';
import { renderWithStore } from '../testUtils/renderWithStore';
import { buildFakeNavigation } from '../testUtils/fakeNavigation';

const product: Product = {
  id: 'p-1',
  name: 'Wireless Mouse',
  description: null,
  priceInCents: 500000,
  currency: 'COP',
  stock: 5,
  imageUrl: null,
  isActive: true,
};

describe('HomeProductsScreen', () => {
  it('renders the product catalog', async () => {
    const navigation = buildFakeNavigation();
    await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <HomeProductsScreen navigation={navigation as any} route={{ key: 'Home', name: 'Home' } as any} />,
      { products: { items: [product], status: 'succeeded' } },
    );

    expect(screen.getByText('Wireless Mouse')).toBeTruthy();
  });

  it('adds a product to the cart and shows the cart badge', async () => {
    const navigation = buildFakeNavigation();
    await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <HomeProductsScreen navigation={navigation as any} route={{ key: 'Home', name: 'Home' } as any} />,
      { products: { items: [product], status: 'succeeded' } },
    );

    expect(screen.queryByTestId('cart-fab-badge')).toBeNull();

    await fireEvent.press(screen.getByTestId('add-button-p-1'));

    expect(screen.getByTestId('cart-fab-badge')).toBeTruthy();
  });

  it('opens the cart sheet from the cart button and navigates to Checkout from it', async () => {
    const navigation = buildFakeNavigation();
    await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <HomeProductsScreen navigation={navigation as any} route={{ key: 'Home', name: 'Home' } as any} />,
      {
        products: { items: [product], status: 'succeeded' },
        cart: { items: [{ productId: 'p-1', name: 'Wireless Mouse', priceInCents: 500000, currency: 'COP', quantity: 1 }] },
      },
    );

    await fireEvent.press(screen.getByTestId('cart-fab-button'));
    await fireEvent.press(screen.getByTestId('go-to-checkout-button'));

    expect(navigation.navigate).toHaveBeenCalledWith('Checkout');
  });

  it('navigates to More from the bottom nav bar', async () => {
    const navigation = buildFakeNavigation();
    await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <HomeProductsScreen navigation={navigation as any} route={{ key: 'Home', name: 'Home' } as any} />,
      { products: { items: [product], status: 'succeeded' } },
    );

    await fireEvent.press(screen.getByTestId('bottom-nav-more'));
    expect(navigation.navigate).toHaveBeenCalledWith('More');
  });

  it('opens the cart sheet from the bottom nav center button', async () => {
    const navigation = buildFakeNavigation();
    await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <HomeProductsScreen navigation={navigation as any} route={{ key: 'Home', name: 'Home' } as any} />,
      {
        products: { items: [product], status: 'succeeded' },
        cart: { items: [{ productId: 'p-1', name: 'Wireless Mouse', priceInCents: 500000, currency: 'COP', quantity: 1 }] },
      },
    );

    await fireEvent.press(screen.getByTestId('bottom-nav-cart-center'));

    expect(screen.getByTestId('go-to-checkout-button')).toBeTruthy();
  });

  it('shows a loading message while fetching', async () => {
    const navigation = buildFakeNavigation();
    await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <HomeProductsScreen navigation={navigation as any} route={{ key: 'Home', name: 'Home' } as any} />,
      { products: { items: [], status: 'loading' } },
    );

    expect(screen.getByText('Cargando productos...')).toBeTruthy();
  });

  it('shows an error message when loading fails', async () => {
    const navigation = buildFakeNavigation();
    await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <HomeProductsScreen navigation={navigation as any} route={{ key: 'Home', name: 'Home' } as any} />,
      { products: { items: [], status: 'failed' } },
    );

    expect(screen.getByText('No se pudo cargar el catálogo. Desliza para reintentar.')).toBeTruthy();
  });
});
