import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Badge } from '../../src/components/Badge';

describe('Badge', () => {
  it('renders its label', async () => {
    await render(<Badge label="-20%" tone="danger" testID="discount-badge" />);
    expect(screen.getByText('-20%')).toBeTruthy();
  });

  it.each(['primary', 'success', 'warning', 'danger', 'neutral'] as const)(
    'renders the %s tone without crashing',
    async (tone) => {
      await render(<Badge label="In stock" tone={tone} testID="badge" />);
      expect(screen.getByTestId('badge')).toBeTruthy();
    },
  );

  it('defaults to the neutral tone', async () => {
    await render(<Badge label="New" testID="badge" />);
    expect(screen.getByTestId('badge')).toBeTruthy();
  });
});
