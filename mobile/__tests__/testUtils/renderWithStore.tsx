import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react-native';
import { cartReducer, CartState } from '../../src/features/cart/cartSlice';
import { productsReducer, ProductsState } from '../../src/features/products/productsSlice';
import { transactionReducer, TransactionState } from '../../src/features/transaction/transactionSlice';

export interface PreloadedState {
  products?: Partial<ProductsState>;
  cart?: Partial<CartState>;
  transaction?: Partial<TransactionState>;
}

export function buildTestStore(preloaded: PreloadedState = {}) {
  const productsState: ProductsState = { items: [], status: 'idle', error: null, ...preloaded.products };
  const cartState: CartState = { items: [], ...preloaded.cart };
  const transactionState: TransactionState = {
    current: null,
    status: 'idle',
    error: null,
    ...preloaded.transaction,
  };

  return configureStore({
    reducer: {
      products: productsReducer,
      cart: cartReducer,
      transaction: transactionReducer,
    },
    preloadedState: {
      products: productsState,
      cart: cartState,
      transaction: transactionState,
    },
  });
}

export async function renderWithStore(
  ui: React.ReactElement,
  preloaded: PreloadedState = {},
): Promise<Awaited<ReturnType<typeof render>> & { store: ReturnType<typeof buildTestStore> }> {
  const store = buildTestStore(preloaded);
  const Wrapper = ({ children }: PropsWithChildren): React.JSX.Element => (
    <Provider store={store}>{children}</Provider>
  );
  const result = await render(ui, { wrapper: Wrapper });
  return { ...result, store };
}
