import React, { useMemo } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './src/app/store';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider, useThemeContext } from './src/theme/ThemeContext';

function AppContent(): React.JSX.Element {
  const { theme, isDark } = useThemeContext();
  const isDarkMode = theme.mode === 'dark';

  const navigationTheme = useMemo(() => {
    const base = isDarkMode ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: theme.colors.background,
        card: theme.colors.card,
        text: theme.colors.text,
        border: theme.colors.border,
        primary: theme.colors.primary,
      },
    };
  }, [isDarkMode, theme]);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <SafeAreaProvider>
          <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
          <NavigationContainer theme={navigationTheme}>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
