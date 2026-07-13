import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { OffersScreen } from '../../src/screens/OffersScreen';

describe('OffersScreen', () => {
  it('renders the coming-soon state', async () => {
    await render(<OffersScreen />);

    expect(screen.getByTestId('offers-screen')).toBeTruthy();
    expect(screen.getByText('Cupones y ofertas')).toBeTruthy();
  });
});
