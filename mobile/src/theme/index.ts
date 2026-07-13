import { ColorPalette } from './colors';
import { RadiiScale } from './radii';
import { ShadowPresets } from './shadows';
import { SpacingScale } from './spacing';
import { TypographyScale } from './typography';

export interface Theme {
  mode: 'light' | 'dark';
  colors: ColorPalette;
  spacing: SpacingScale;
  radii: RadiiScale;
  typography: TypographyScale;
  shadows: ShadowPresets;
}

export { useTheme } from './ThemeContext';

export type { ColorPalette, RadiiScale, ShadowPresets, SpacingScale, TypographyScale };
