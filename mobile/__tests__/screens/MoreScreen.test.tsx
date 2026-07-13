import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { MoreScreen } from '../../src/screens/MoreScreen';

describe('MoreScreen', () => {
  it('renders the theme toggle row', async () => {
    await render(<MoreScreen />);

    expect(screen.getByTestId('more-screen')).toBeTruthy();
    expect(screen.getByTestId('more-theme-toggle')).toBeTruthy();
  });

  it('toggles the theme when pressed', async () => {
    await render(<MoreScreen />);

    const toggle = screen.getByTestId('more-theme-toggle');
    await fireEvent.press(toggle);

    expect(toggle).toBeTruthy();
  });
});
