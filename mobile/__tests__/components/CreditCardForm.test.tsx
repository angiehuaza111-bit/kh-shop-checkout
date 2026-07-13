import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { CreditCardForm } from '../../src/components/CreditCardForm';

async function fillValidForm(): Promise<void> {
  await fireEvent.changeText(screen.getByTestId('input-card-number'), '4242424242424242');
  await fireEvent.changeText(screen.getByTestId('input-card-holder'), 'John Doe');
  await fireEvent.changeText(screen.getByTestId('input-expiry-month'), '12');
  await fireEvent.changeText(screen.getByTestId('input-expiry-year'), '99');
  await fireEvent.changeText(screen.getByTestId('input-cvc'), '123');
  await fireEvent.changeText(screen.getByTestId('input-email'), 'buyer@example.com');
}

describe('CreditCardForm', () => {
  it('calls onSubmit with the entered values when the form is valid', async () => {
    const onSubmit = jest.fn();
    await render(<CreditCardForm onSubmit={onSubmit} />);

    await fillValidForm();
    await fireEvent.press(screen.getByTestId('continue-button'));

    expect(onSubmit).toHaveBeenCalledWith({
      number: '4242 4242 4242 4242',
      cardHolder: 'John Doe',
      expiryMonth: '12',
      expiryYear: '99',
      cvc: '123',
      customerEmail: 'buyer@example.com',
    });
  });

  it('does not submit and shows errors when the form is invalid', async () => {
    const onSubmit = jest.fn();
    await render(<CreditCardForm onSubmit={onSubmit} />);

    await fireEvent.press(screen.getByTestId('continue-button'));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Ingrese un número de tarjeta válido')).toBeTruthy();
  });

  it('renders the detected card brand badge as the number is typed', async () => {
    await render(<CreditCardForm onSubmit={jest.fn()} />);

    await fireEvent.changeText(screen.getByTestId('input-card-number'), '4242424242424242');

    expect(screen.getByTestId('card-brand-VISA')).toBeTruthy();
  });

  it('calls onValuesChange on every keystroke so a parent can drive a live preview', async () => {
    const onValuesChange = jest.fn();
    await render(<CreditCardForm onSubmit={jest.fn()} onValuesChange={onValuesChange} />);

    await fireEvent.changeText(screen.getByTestId('input-card-number'), '4242');

    expect(onValuesChange).toHaveBeenCalledWith(
      expect.objectContaining({ number: '4242' }),
    );
  });
});
