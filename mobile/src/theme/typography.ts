export interface TypographyScale {
  sizes: {
    display: number;
    h1: number;
    h2: number;
    h3: number;
    body: number;
    bodySmall: number;
    caption: number;
  };
  weights: {
    regular: '400';
    medium: '500';
    semibold: '600';
    bold: '700';
    extrabold: '800';
  };
  lineHeights: {
    display: number;
    h1: number;
    h2: number;
    h3: number;
    body: number;
    bodySmall: number;
    caption: number;
  };
}

/** System font only — avoids bundling a custom font asset (another native concern). */
export const typography: TypographyScale = {
  sizes: {
    display: 34,
    h1: 28,
    h2: 22,
    h3: 17,
    body: 15,
    bodySmall: 13,
    caption: 11,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeights: {
    display: 40,
    h1: 34,
    h2: 28,
    h3: 22,
    body: 22,
    bodySmall: 18,
    caption: 14,
  },
};
