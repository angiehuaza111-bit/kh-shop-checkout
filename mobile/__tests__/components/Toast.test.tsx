import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Toast } from '../../src/components/Toast';

describe('Toast', () => {
  it('renders nothing when there is no message', async () => {
    const { toJSON } = await render(<Toast message={null} onHide={jest.fn()} />);
    expect(toJSON()).toBeNull();
  });

  it('renders the message when provided', async () => {
    await render(<Toast message="Something went wrong" onHide={jest.fn()} />);
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });

  it('calls onHide automatically after the duration elapses', async () => {
    jest.useFakeTimers();
    const onHide = jest.fn();
    await render(<Toast message="Error" onHide={onHide} durationMs={1000} />);

    jest.advanceTimersByTime(1000);

    expect(onHide).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
