import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Backdrop } from '../../src/components/Backdrop';

describe('Backdrop', () => {
  it('renders its title and children when visible', async () => {
    await render(
      <Backdrop visible title="Credit card details" onClose={jest.fn()}>
        <Text>Form content</Text>
      </Backdrop>,
    );

    expect(screen.getByText('Credit card details')).toBeTruthy();
    expect(screen.getByText('Form content')).toBeTruthy();
  });

  it('calls onClose when the scrim is pressed', async () => {
    const onClose = jest.fn();
    await render(
      <Backdrop visible title="Title" onClose={onClose}>
        <Text>Content</Text>
      </Backdrop>,
    );

    await fireEvent.press(screen.getByTestId('backdrop-scrim-dismiss'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
