import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

function Bomb({ shouldThrow }: { shouldThrow: boolean }): React.JSX.Element {
  if (shouldThrow) {
    throw new Error('boom');
  }
  return <Text>All good</Text>;
}

const toggleableErrorState = { shouldThrow: true };
function ToggleableBomb(): React.JSX.Element {
  if (toggleableErrorState.shouldThrow) {
    throw new Error('boom');
  }
  return <Text>Recovered</Text>;
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    toggleableErrorState.shouldThrow = true;
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when there is no error', async () => {
    await render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('All good')).toBeTruthy();
  });

  it('renders a fallback UI when a child throws', async () => {
    await render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('error-boundary-fallback')).toBeTruthy();
  });

  it('allows recovering once the underlying error condition clears', async () => {
    await render(
      <ErrorBoundary>
        <ToggleableBomb />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('error-boundary-fallback')).toBeTruthy();

    toggleableErrorState.shouldThrow = false;
    await fireEvent.press(screen.getByTestId('error-boundary-retry'));

    expect(screen.queryByTestId('error-boundary-fallback')).toBeNull();
    expect(screen.getByText('Recovered')).toBeTruthy();
  });
});
