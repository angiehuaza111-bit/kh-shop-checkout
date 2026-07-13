import React from 'react';
import { screen, waitFor } from '@testing-library/react-native';
import { SplashScreen } from '../../src/screens/SplashScreen';
import { renderWithStore } from '../testUtils/renderWithStore';
import { buildFakeNavigation } from '../testUtils/fakeNavigation';

describe('SplashScreen', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('loads the catalog and navigates to Home', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    }) as unknown as typeof fetch;
    const navigation = buildFakeNavigation();

    await renderWithStore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <SplashScreen navigation={navigation as any} route={{ key: 'Splash', name: 'Splash' } as any} />,
    );

    expect(screen.getByTestId('splash-screen')).toBeTruthy();

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('Home'), { timeout: 3000 });
  });
});
