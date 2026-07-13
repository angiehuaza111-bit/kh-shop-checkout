import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from '../../src/components/Button';

describe('Button', () => {
  it('renders its label and calls onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<Button label="Pay now" onPress={onPress} testID="pay-button" />);

    expect(screen.getByText('Pay now')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('pay-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    await render(<Button label="Pay now" onPress={onPress} disabled testID="pay-button" />);

    await fireEvent.press(screen.getByTestId('pay-button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows a spinner instead of the label while loading, and blocks presses', async () => {
    const onPress = jest.fn();
    await render(<Button label="Pay now" onPress={onPress} loading testID="pay-button" />);

    expect(screen.queryByText('Pay now')).toBeNull();
    await fireEvent.press(screen.getByTestId('pay-button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders custom children instead of a label when provided', async () => {
    await render(
      <Button onPress={jest.fn()} testID="icon-button">
        <Text>Custom content</Text>
      </Button>,
    );

    expect(screen.getByText('Custom content')).toBeTruthy();
  });

  it.each(['primary', 'secondary', 'outline', 'ghost'] as const)(
    'renders the %s variant without crashing',
    async (variant) => {
      await render(<Button label="Continue" onPress={jest.fn()} variant={variant} testID="btn" />);
      expect(screen.getByTestId('btn')).toBeTruthy();
    },
  );

  it.each(['rect', 'pill', 'circle'] as const)('renders the %s shape without crashing', async (shape) => {
    await render(<Button label="Continue" onPress={jest.fn()} shape={shape} testID="btn" />);
    expect(screen.getByTestId('btn')).toBeTruthy();
  });
});
