import { configureStore } from '@reduxjs/toolkit';
import {
  createTransaction,
  resetTransaction,
  Transaction,
  transactionReducer,
} from '../../src/features/transaction/transactionSlice';
import { CartItem } from '../../src/features/cart/cartSlice';

function buildStore() {
  return configureStore({ reducer: { transaction: transactionReducer } });
}

const cartItems: CartItem[] = [
  { productId: 'p-1', name: 'Mouse', priceInCents: 1000, currency: 'COP', quantity: 1 },
];

describe('transactionSlice', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('creates a transaction successfully', async () => {
    const transaction: Transaction = {
      id: 't-1',
      reference: 'REF-1',
      status: 'APPROVED',
      amountInCents: 1000,
      currency: 'COP',
      customerEmail: 'buyer@example.com',
      cardLastFour: '4242',
      cardBrand: 'VISA',
      failureReason: null,
      items: [{ productId: 'p-1', quantity: 1, unitPriceInCents: 1000, subtotalInCents: 1000 }],
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(transaction),
    }) as unknown as typeof fetch;

    const store = buildStore();
    await store.dispatch(
      createTransaction({ items: cartItems, customerEmail: 'buyer@example.com', cardToken: 'tok_1' }),
    );

    const state = store.getState().transaction;
    expect(state.status).toBe('succeeded');
    expect(state.current).toEqual(transaction);
  });

  it('records the backend error message when the request fails', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'Insufficient stock' }),
    }) as unknown as typeof fetch;

    const store = buildStore();
    await store.dispatch(
      createTransaction({ items: cartItems, customerEmail: 'buyer@example.com', cardToken: 'tok_1' }),
    );

    const state = store.getState().transaction;
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Insufficient stock');
  });

  it('resetTransaction clears the current transaction and status', () => {
    const store = buildStore();
    store.dispatch(resetTransaction());

    const state = store.getState().transaction;
    expect(state.current).toBeNull();
    expect(state.status).toBe('idle');
  });
});
