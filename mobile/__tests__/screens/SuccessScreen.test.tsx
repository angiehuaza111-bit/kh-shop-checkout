import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { SuccessScreen } from '../../src/screens/SuccessScreen';
import { renderWithStore } from '../testUtils/renderWithStore';
import { buildFakeNavigation } from '../testUtils/fakeNavigation';
import { Transaction } from '../../src/features/transaction/transactionSlice';

function buildTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 't-1',
    reference: 'REF-1',
    status: 'APPROVED',
    amountInCents: 500000,
    currency: 'COP',
    customerEmail: 'buyer@example.com',
    cardLastFour: '4242',
    cardBrand: 'VISA',
    failureReason: null,
    items: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('SuccessScreen', () => {
  it('shows the approved copy and transaction details', async () => {
    const navigation = buildFakeNavigation();
    await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <SuccessScreen navigation={navigation as any} route={{ key: 'Success', name: 'Success' } as any} />,
      { transaction: { current: buildTransaction({ status: 'APPROVED' }) } },
    );

    await waitFor(() => {
      expect(screen.getByText('Aprobado')).toBeTruthy();
    }, { timeout: 5000 });
    expect(screen.getByText('REF-1')).toBeTruthy();
  });

  it('shows the pending/confirming copy for a PENDING transaction', async () => {
    const navigation = buildFakeNavigation();
    await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <SuccessScreen navigation={navigation as any} route={{ key: 'Success', name: 'Success' } as any} />,
      { transaction: { current: buildTransaction({ status: 'PENDING' }) } },
    );

    expect(screen.getByText('Verificando tu pago...')).toBeTruthy();
  });

  it('clears cart/transaction and resets to Home when "Back to store" is pressed', async () => {
    const navigation = buildFakeNavigation();
    const { store } = await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <SuccessScreen navigation={navigation as any} route={{ key: 'Success', name: 'Success' } as any} />,
      {
        transaction: { current: buildTransaction() },
        cart: { items: [{ productId: 'p-1', name: 'Mouse', priceInCents: 500000, currency: 'COP', quantity: 1 }] },
      },
    );

    await fireEvent.press(screen.getByTestId('back-to-home-button'));

    expect(store.getState().cart.items).toEqual([]);
    expect(store.getState().transaction.current).toBeNull();
    expect(navigation.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Home' }] });
  });
});
