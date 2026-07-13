import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { FailureScreen } from '../../src/screens/FailureScreen';
import { renderWithStore } from '../testUtils/renderWithStore';
import { buildFakeNavigation } from '../testUtils/fakeNavigation';
import { Transaction } from '../../src/features/transaction/transactionSlice';

function buildTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 't-1',
    reference: 'REF-1',
    status: 'DECLINED',
    amountInCents: 500000,
    currency: 'COP',
    customerEmail: 'buyer@example.com',
    cardLastFour: '4242',
    cardBrand: 'VISA',
    failureReason: 'Insufficient funds',
    items: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('FailureScreen', () => {
  it('shows the declined copy and failure reason', async () => {
    const navigation = buildFakeNavigation();
    await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <FailureScreen navigation={navigation as any} route={{ key: 'Failure', name: 'Failure' } as any} />,
      { transaction: { current: buildTransaction({ status: 'DECLINED' }) } },
    );

    expect(screen.getByText('Rechazado')).toBeTruthy();
    expect(screen.getByText('Insufficient funds')).toBeTruthy();
  });

  it('shows the generic error copy for an ERROR transaction', async () => {
    const navigation = buildFakeNavigation();
    await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <FailureScreen navigation={navigation as any} route={{ key: 'Failure', name: 'Failure' } as any} />,
      { transaction: { current: buildTransaction({ status: 'ERROR', failureReason: 'Gateway timeout' }) } },
    );

    expect(screen.getByText('Algo salió mal')).toBeTruthy();
  });

  it('falls back to the generic error copy when there is no transaction', async () => {
    const navigation = buildFakeNavigation();
    await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <FailureScreen navigation={navigation as any} route={{ key: 'Failure', name: 'Failure' } as any} />,
      { transaction: { current: null } },
    );

    expect(screen.getByText('Algo salió mal')).toBeTruthy();
  });

  it('clears cart/transaction and resets to Home when "Back to store" is pressed', async () => {
    const navigation = buildFakeNavigation();
    const { store } = await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <FailureScreen navigation={navigation as any} route={{ key: 'Failure', name: 'Failure' } as any} />,
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
