import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearPersistedTransaction,
  loadPersistedTransaction,
  persistTransaction,
} from '../../src/app/persistence';
import { Transaction } from '../../src/features/transaction/transactionSlice';

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

describe('transaction persistence', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('persists and reloads a transaction', async () => {
    await persistTransaction(transaction);

    const loaded = await loadPersistedTransaction();

    expect(loaded).toEqual(transaction);
  });

  it('stores the data encrypted, not as plain JSON', async () => {
    await persistTransaction(transaction);

    const raw = await AsyncStorage.getItem('checkout-mobile:last-transaction');

    expect(raw).not.toContain(transaction.reference);
  });

  it('returns null when nothing has been persisted yet', async () => {
    expect(await loadPersistedTransaction()).toBeNull();
  });

  it('clears the persisted transaction', async () => {
    await persistTransaction(transaction);
    await clearPersistedTransaction();

    expect(await loadPersistedTransaction()).toBeNull();
  });
});
