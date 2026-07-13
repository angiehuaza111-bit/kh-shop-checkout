import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { CouponInput } from '../../src/components/CouponInput';

describe('CouponInput', () => {
  it('renders the input and apply button when no coupon is applied', async () => {
    await render(<CouponInput value="" onChangeText={jest.fn()} onApply={jest.fn()} />);
    expect(screen.getByTestId('coupon-input')).toBeTruthy();
    expect(screen.getByTestId('coupon-apply-button')).toBeTruthy();
  });

  it('calls onChangeText as the user types', async () => {
    const onChangeText = jest.fn();
    await render(<CouponInput value="" onChangeText={onChangeText} onApply={jest.fn()} />);
    await fireEvent.changeText(screen.getByTestId('coupon-input'), 'SAVE10');
    expect(onChangeText).toHaveBeenCalledWith('SAVE10');
  });

  it('calls onApply when the apply button is pressed', async () => {
    const onApply = jest.fn();
    await render(<CouponInput value="SAVE10" onChangeText={jest.fn()} onApply={onApply} />);
    await fireEvent.press(screen.getByTestId('coupon-apply-button'));
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('shows an error message when provided', async () => {
    await render(
      <CouponInput value="BAD" onChangeText={jest.fn()} onApply={jest.fn()} error="Invalid code" />,
    );
    expect(screen.getByTestId('coupon-error')).toBeTruthy();
    expect(screen.getByText('Invalid code')).toBeTruthy();
  });

  it('shows the applied state instead of the input when appliedLabel is set', async () => {
    await render(
      <CouponInput value="" onChangeText={jest.fn()} onApply={jest.fn()} appliedLabel="Coupon applied" />,
    );
    expect(screen.getByTestId('coupon-applied')).toBeTruthy();
    expect(screen.queryByTestId('coupon-input')).toBeNull();
  });
});
