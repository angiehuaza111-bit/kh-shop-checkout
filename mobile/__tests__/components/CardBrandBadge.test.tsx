import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { CardBrandBadge } from '../../src/components/CardBrandBadge';

describe('CardBrandBadge', () => {
  it('renders the VISA label', async () => {
    await render(<CardBrandBadge brand="VISA" />);
    expect(screen.getByText('VISA')).toBeTruthy();
  });

  it('renders the Mastercard label', async () => {
    await render(<CardBrandBadge brand="MASTERCARD" />);
    expect(screen.getByText('MC')).toBeTruthy();
  });

  it('renders nothing for an unknown brand', async () => {
    const { toJSON } = await render(<CardBrandBadge brand="UNKNOWN" />);
    expect(toJSON()).toBeNull();
  });
});
