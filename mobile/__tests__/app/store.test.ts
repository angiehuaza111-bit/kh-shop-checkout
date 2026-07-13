import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAppStore } from '../../src/app/store';
import { createTransaction, Transaction } from '../../src/features/transaction/transactionSlice';

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
  items: [],
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('createAppStore', () => {
  const originalFetch = globalThis.fetch;

  afterEach(async () => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
    await AsyncStorage.clear();
  });

  it('wires the three feature reducers together', () => {
    const store = createAppStore();
    const state = store.getState();

    expect(state).toHaveProperty('products');
    expect(state).toHaveProperty('cart');
    expect(state).toHaveProperty('transaction');
  });

  it('persists the transaction to storage once a transaction is created', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(transaction),
    }) as unknown as typeof fetch;

    const store = createAppStore();
    await store.dispatch(
      createTransaction({ items: [], customerEmail: 'buyer@example.com', cardToken: 'tok_1' }),
    );

    const stored = await AsyncStorage.getItem('checkout-mobile:last-transaction');
    expect(stored).not.toBeNull();
    expect(stored).not.toContain(transaction.reference);
  });
});
