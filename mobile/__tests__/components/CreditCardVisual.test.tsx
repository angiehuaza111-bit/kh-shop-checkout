import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { CreditCardVisual } from '../../src/components/CreditCardVisual';

describe('CreditCardVisual', () => {
  it('shows placeholder fallbacks before any input', async () => {
    await render(
      <CreditCardVisual number="" cardHolder="" expiryMonth="" expiryYear="" brand="UNKNOWN" />,
    );
    expect(screen.getByText('TU NOMBRE')).toBeTruthy();
    expect(screen.getByText('MM/YY')).toBeTruthy();
    expect(screen.getByText('•••• •••• •••• ••••')).toBeTruthy();
  });

  it('masks partially typed card numbers, keeping typed digits visible', async () => {
    await render(
      <CreditCardVisual number="4242" cardHolder="" expiryMonth="" expiryYear="" brand="VISA" />,
    );
    expect(screen.getByText('4242  •••• •••• ••••')).toBeTruthy();
  });

  it('uppercases the cardholder name and formats the expiry', async () => {
    await render(
      <CreditCardVisual
        number="4242424242424242"
        cardHolder="john doe"
        expiryMonth="09"
        expiryYear="27"
        brand="VISA"
      />,
    );
    expect(screen.getByText('JOHN DOE')).toBeTruthy();
    expect(screen.getByText('09/27')).toBeTruthy();
  });

  it('renders the brand badge for a detected brand', async () => {
    await render(
      <CreditCardVisual
        number="5254133610955779"
        cardHolder="Jane Doe"
        expiryMonth="01"
        expiryYear="30"
        brand="MASTERCARD"
      />,
    );
    expect(screen.getByTestId('card-brand-MASTERCARD')).toBeTruthy();
  });

  it('supports a custom testID', async () => {
    await render(
      <CreditCardVisual
        number=""
        cardHolder=""
        expiryMonth=""
        expiryYear=""
        brand="UNKNOWN"
        testID="payment-card-visual"
      />,
    );
    expect(screen.getByTestId('payment-card-visual')).toBeTruthy();
  });
});
