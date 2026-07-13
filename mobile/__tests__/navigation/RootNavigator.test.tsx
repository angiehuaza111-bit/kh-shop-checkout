import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react-native';
import { RootNavigator } from '../../src/navigation/RootNavigator';
import { createAppStore } from '../../src/app/store';

describe('RootNavigator', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('starts on the Splash screen without crashing', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    }) as unknown as typeof fetch;

    await render(
      <Provider store={createAppStore()}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </Provider>,
    );

    expect(screen.getByTestId('splash-screen')).toBeTruthy();
  });
});
