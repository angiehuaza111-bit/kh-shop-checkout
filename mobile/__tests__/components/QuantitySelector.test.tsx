import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { QuantitySelector } from '../../src/components/QuantitySelector';

describe('QuantitySelector', () => {
  it('renders the current quantity', async () => {
    await render(
      <QuantitySelector quantity={3} onIncrement={jest.fn()} onDecrement={jest.fn()} testIDPrefix="p-1" />,
    );
    expect(screen.getByTestId('quantity-p-1')).toHaveTextContent('3');
  });

  it('calls onIncrement/onDecrement when the buttons are pressed', async () => {
    const onIncrement = jest.fn();
    const onDecrement = jest.fn();
    await render(
      <QuantitySelector quantity={1} onIncrement={onIncrement} onDecrement={onDecrement} testIDPrefix="p-1" />,
    );

    await fireEvent.press(screen.getByTestId('increment-button-p-1'));
    await fireEvent.press(screen.getByTestId('decrement-button-p-1'));

    expect(onIncrement).toHaveBeenCalledTimes(1);
    expect(onDecrement).toHaveBeenCalledTimes(1);
  });

  it('disables increment when incrementDisabled is true', async () => {
    const onIncrement = jest.fn();
    await render(
      <QuantitySelector
        quantity={5}
        onIncrement={onIncrement}
        onDecrement={jest.fn()}
        incrementDisabled
        testIDPrefix="p-1"
      />,
    );

    await fireEvent.press(screen.getByTestId('increment-button-p-1'));
    expect(onIncrement).not.toHaveBeenCalled();
  });
});
