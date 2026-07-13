import React from 'react';
import { screen } from '@testing-library/react-native';
import { HistoryScreen } from '../../src/screens/HistoryScreen';
import { renderWithStore } from '../testUtils/renderWithStore';

describe('HistoryScreen', () => {
  it('shows an empty state when there is no transaction', async () => {
    await renderWithStore(<HistoryScreen />);

    expect(screen.getByText('Aun no tienes transacciones')).toBeTruthy();
  });

  it('shows the last transaction details when one exists', async () => {
    await renderWithStore(<HistoryScreen />, {
      transaction: {
        current: {
          id: 'tx-1',
          reference: 'ref-123',
          status: 'APPROVED',
          amountInCents: 1000000,
          currency: 'COP',
          customerEmail: 'test@test.com',
          cardLastFour: '4242',
          cardBrand: 'VISA',
          failureReason: null,
          items: [],
          createdAt: new Date().toISOString(),
        },
      },
    });

    expect(screen.getByText('ref-123')).toBeTruthy();
    expect(screen.getByText('Aprobado')).toBeTruthy();
    expect(screen.getByText('VISA **** 4242')).toBeTruthy();
  });
});
