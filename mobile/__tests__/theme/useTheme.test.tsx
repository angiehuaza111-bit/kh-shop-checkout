import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider, useThemeContext } from '../../src/theme/ThemeContext';

function ThemeConsumer() {
  const { theme, isDark, toggleTheme } = useThemeContext();
  return (
    <>
      <Text testID="mode">{theme.mode}</Text>
      <Text testID="background">{theme.colors.background}</Text>
      <Text testID="primary">{theme.colors.primary}</Text>
      <Text testID="isDark">{String(isDark)}</Text>
      <Text testID="shadow-border">{String(theme.shadows.card.borderWidth)}</Text>
      <Text testID="shadow-color">{String(theme.shadows.card.shadowColor)}</Text>
      <Text testID="spacing-xs">{String(theme.spacing.xs)}</Text>
      <Text testID="spacing-xxl">{String(theme.spacing.xxl)}</Text>
      <Text testID="toggle" onPress={toggleTheme}>toggle</Text>
    </>
  );
}

describe('useTheme (via ThemeContext)', () => {
  it('returns the light palette by default', async () => {
    await render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    expect(screen.getByTestId('background')).toHaveTextContent('#F7F8FA');
    expect(screen.getByTestId('primary')).toHaveTextContent('#2563EB');
  });

  it('toggles to dark mode', async () => {
    await render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    expect(screen.getByTestId('mode')).toHaveTextContent('light');

    await act(async () => {
      fireEvent.press(screen.getByText('toggle'));
    });

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('background')).toHaveTextContent('#0B1220');
    expect(screen.getByTestId('primary')).toHaveTextContent('#4F8CFF');
    expect(screen.getByTestId('isDark')).toHaveTextContent('true');
  });

  it('uses a subtle border instead of a black shadow for dark-mode cards', async () => {
    await render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);

    await act(async () => {
      fireEvent.press(screen.getByText('toggle'));
    });

    expect(screen.getByTestId('shadow-border')).toHaveTextContent('1');
    expect(screen.getByTestId('shadow-color')).toHaveTextContent('undefined');
  });

  it('uses a real shadow (no border) for light-mode cards', async () => {
    await render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    expect(screen.getByTestId('shadow-color')).toHaveTextContent('#0F172A');
    expect(screen.getByTestId('shadow-border')).toHaveTextContent('undefined');
  });

  it('exposes the 8pt spacing scale', async () => {
    await render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
    expect(screen.getByTestId('spacing-xs')).toHaveTextContent('4');
    expect(screen.getByTestId('spacing-xxl')).toHaveTextContent('48');
  });
});
