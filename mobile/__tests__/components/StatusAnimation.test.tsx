import React from 'react';
import { Animated } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { StatusAnimation } from '../../src/components/StatusAnimation';

describe('StatusAnimation', () => {
  it('renders the success variant', async () => {
    await render(<StatusAnimation variant="success" />);
    expect(screen.getByTestId('status-animation-success')).toBeTruthy();
  });

  it('renders the processing variant', async () => {
    await render(<StatusAnimation variant="processing" />);
    expect(screen.getByTestId('status-animation-processing')).toBeTruthy();
  });

  it('renders the error variant', async () => {
    await render(<StatusAnimation variant="error" />);
    expect(screen.getByTestId('status-animation-error')).toBeTruthy();
  });

  it('accepts a custom tone and size without crashing', async () => {
    await render(<StatusAnimation variant="success" tone="primary" size={40} />);
    expect(screen.getByTestId('status-animation-success')).toBeTruthy();
  });

  it('stops the processing loop animation on unmount (no leaked timers)', async () => {
    const stopSpy = jest.fn();
    const loopSpy = jest.spyOn(Animated, 'loop').mockReturnValue({
      start: jest.fn(),
      stop: stopSpy,
      reset: jest.fn(),
    } as unknown as Animated.CompositeAnimation);

    const { unmount } = await render(<StatusAnimation variant="processing" />);
    await unmount();

    expect(stopSpy).toHaveBeenCalledTimes(1);
    loopSpy.mockRestore();
  });
});
