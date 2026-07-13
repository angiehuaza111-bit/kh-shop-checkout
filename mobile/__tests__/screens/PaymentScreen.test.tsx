import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { PaymentScreen } from '../../src/screens/PaymentScreen';
import { renderWithStore } from '../testUtils/renderWithStore';
import { buildFakeNavigation } from '../testUtils/fakeNavigation';
import { CardTokenizationError } from '../../src/features/paymentGateway/tokenizeCard';

jest.mock('../../src/features/paymentGateway/tokenizeCard', () => ({
  ...jest.requireActual('../../src/features/paymentGateway/tokenizeCard'),
  tokenizeCard: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { tokenizeCard } = require('../../src/features/paymentGateway/tokenizeCard');

const cartState = {
  items: [
    { productId: 'p-1', name: 'Wireless Mouse', priceInCents: 500000, currency: 'COP', quantity: 1 },
  ],
};

function mockTransactionResponse(status: 'APPROVED' | 'PENDING' | 'DECLINED' | 'ERROR'): void {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        id: 't-1',
        reference: 'REF-1',
        status,
        amountInCents: 500000,
        currency: 'COP',
        customerEmail: 'buyer@example.com',
        cardLastFour: '4242',
        cardBrand: 'VISA',
        failureReason: status === 'DECLINED' ? 'Insufficient funds' : null,
        items: [],
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
  }) as unknown as typeof fetch;
}

async function fillAndSubmitCardForm(): Promise<void> {
  await fireEvent.changeText(screen.getByTestId('input-card-number'), '4242424242424242');
  await fireEvent.changeText(screen.getByTestId('input-card-holder'), 'John Doe');
  await fireEvent.changeText(screen.getByTestId('input-expiry-month'), '12');
  await fireEvent.changeText(screen.getByTestId('input-expiry-year'), '99');
  await fireEvent.changeText(screen.getByTestId('input-cvc'), '123');
  await fireEvent.changeText(screen.getByTestId('input-email'), 'buyer@example.com');
  await fireEvent.press(screen.getByTestId('continue-button'));
}

describe('PaymentScreen', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('shows a live card preview as the form is filled in', async () => {
    const navigation = buildFakeNavigation();
    await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <PaymentScreen navigation={navigation as any} route={{ key: 'Payment', name: 'Payment' } as any} />,
      { cart: cartState },
    );

    expect(screen.getByTestId('credit-card-visual')).toBeTruthy();
    await fireEvent.changeText(screen.getByTestId('input-card-number'), '4242');
    expect(screen.getByText('4242  •••• •••• ••••')).toBeTruthy();
  });

  it('navigates to Success when the transaction resolves APPROVED', async () => {
    tokenizeCard.mockResolvedValue('tok_123');
    mockTransactionResponse('APPROVED');

    const navigation = buildFakeNavigation();
    await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <PaymentScreen navigation={navigation as any} route={{ key: 'Payment', name: 'Payment' } as any} />,
      { cart: cartState },
    );

    await fillAndSubmitCardForm();
    await fireEvent.press(screen.getByTestId('confirm-pay-button'));

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('Success'));
  });

  it('navigates to Success when the transaction resolves PENDING', async () => {
    tokenizeCard.mockResolvedValue('tok_123');
    mockTransactionResponse('PENDING');

    const navigation = buildFakeNavigation();
    await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <PaymentScreen navigation={navigation as any} route={{ key: 'Payment', name: 'Payment' } as any} />,
      { cart: cartState },
    );

    await fillAndSubmitCardForm();
    await fireEvent.press(screen.getByTestId('confirm-pay-button'));

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('Success'));
  });

  it('navigates to Failure when the transaction resolves DECLINED', async () => {
    tokenizeCard.mockResolvedValue('tok_123');
    mockTransactionResponse('DECLINED');

    const navigation = buildFakeNavigation();
    await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <PaymentScreen navigation={navigation as any} route={{ key: 'Payment', name: 'Payment' } as any} />,
      { cart: cartState },
    );

    await fillAndSubmitCardForm();
    await fireEvent.press(screen.getByTestId('confirm-pay-button'));

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('Failure'));
  });

  it('navigates to Failure when the transaction resolves ERROR', async () => {
    tokenizeCard.mockResolvedValue('tok_123');
    mockTransactionResponse('ERROR');

    const navigation = buildFakeNavigation();
    await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <PaymentScreen navigation={navigation as any} route={{ key: 'Payment', name: 'Payment' } as any} />,
      { cart: cartState },
    );

    await fillAndSubmitCardForm();
    await fireEvent.press(screen.getByTestId('confirm-pay-button'));

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('Failure'));
  });

  it('shows a toast and stays on the screen when tokenization fails (request-level failure)', async () => {
    tokenizeCard.mockRejectedValue(new CardTokenizationError('Card tokenization failed (status 422)'));

    const navigation = buildFakeNavigation();
    await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <PaymentScreen navigation={navigation as any} route={{ key: 'Payment', name: 'Payment' } as any} />,
      { cart: cartState },
    );

    await fillAndSubmitCardForm();
    await fireEvent.press(screen.getByTestId('confirm-pay-button'));

    await waitFor(() => expect(screen.getByTestId('toast')).toBeTruthy());
    expect(navigation.replace).not.toHaveBeenCalled();
  });
});
