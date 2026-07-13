import { ViewStyle } from 'react-native';
import { ColorPalette } from './colors';

export interface ShadowPresets {
  card: ViewStyle;
  floating: ViewStyle;
  modal: ViewStyle;
}

/**
 * Black iOS/Android shadows are invisible against a near-black background, so dark
 * mode swaps the shadow for a subtle 1px lighter border instead — the look GitHub
 * Mobile/Nubank use for surface separation in dark mode.
 */
export function createShadows(mode: 'light' | 'dark', colors: ColorPalette): ShadowPresets {
  if (mode === 'dark') {
    const borderStyle: ViewStyle = {
      borderWidth: 1,
      borderColor: colors.border,
    };
    return {
      card: borderStyle,
      floating: { ...borderStyle, elevation: 4 },
      modal: { ...borderStyle, elevation: 8 },
    };
  }

  return {
    card: {
      shadowColor: '#0F172A',
      shadowOpacity: 0.04,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    floating: {
      shadowColor: '#0F172A',
      shadowOpacity: 0.12,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
    modal: {
      shadowColor: '#0F172A',
      shadowOpacity: 0.18,
      shadowRadius: 32,
      shadowOffset: { width: 0, height: -6 },
      elevation: 16,
    },
  };
}
