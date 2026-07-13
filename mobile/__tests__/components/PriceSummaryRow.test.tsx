import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PriceSummaryRow } from '../../src/components/PriceSummaryRow';

describe('PriceSummaryRow', () => {
  it('renders the label and value', async () => {
    await render(<PriceSummaryRow label="Subtotal" value="$50.000" />);
    expect(screen.getByText('Subtotal')).toBeTruthy();
    expect(screen.getByText('$50.000')).toBeTruthy();
  });

  it('renders with emphasis for totals', async () => {
    await render(<PriceSummaryRow label="Total" value="$98.000" emphasis testID="total-row" />);
    expect(screen.getByTestId('total-row')).toBeTruthy();
    expect(screen.getByText('Total')).toBeTruthy();
  });

  it.each(['default', 'muted', 'success'] as const)('renders the %s tone without crashing', async (tone) => {
    await render(<PriceSummaryRow label="Shipping" value="Free" tone={tone} testID="row" />);
    expect(screen.getByTestId('row')).toBeTruthy();
  });
});
