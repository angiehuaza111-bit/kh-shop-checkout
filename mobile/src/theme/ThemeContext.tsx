import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from './colors';
import { radii } from './radii';
import { createShadows } from './shadows';
import { spacing } from './spacing';
import { typography } from './typography';
import type { Theme } from './index';

function buildTheme(mode: 'light' | 'dark'): Theme {
  const colors = mode === 'dark' ? darkColors : lightColors;
  return {
    mode,
    colors,
    spacing,
    radii,
    typography,
    shadows: createShadows(mode, colors),
  };
}

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: buildTheme('light'),
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  const systemScheme = useColorScheme();
  const [manualMode, setManualMode] = useState<'light' | 'dark' | null>(null);

  const isDark = manualMode === null ? systemScheme === 'dark' : manualMode === 'dark';
  const theme = useMemo(() => buildTheme(isDark ? 'dark' : 'light'), [isDark]);

  const toggleTheme = useCallback(() => {
    setManualMode((prev) => {
      if (prev === null) {
        return isDark ? 'light' : 'dark';
      }
      return prev === 'dark' ? 'light' : 'dark';
    });
  }, [isDark]);

  const value = useMemo(() => ({ theme, isDark, toggleTheme }), [theme, isDark, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}

export function useTheme(): Theme {
  return useContext(ThemeContext).theme;
}
