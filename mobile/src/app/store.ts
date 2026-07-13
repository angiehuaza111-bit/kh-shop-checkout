import { configureStore, Middleware } from '@reduxjs/toolkit';
import { cartReducer } from '../features/cart/cartSlice';
import { productsReducer } from '../features/products/productsSlice';
import { createTransaction, transactionReducer } from '../features/transaction/transactionSlice';
import { persistTransaction } from './persistence';

const persistTransactionMiddleware: Middleware = () => (next) => (action) => {
  const result = next(action);
  if (createTransaction.fulfilled.match(action)) {
    void persistTransaction(action.payload);
  }
  return result;
};

export function createAppStore() {
  return configureStore({
    reducer: {
      products: productsReducer,
      cart: cartReducer,
      transaction: transactionReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(persistTransactionMiddleware),
  });
}

export const store = createAppStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
