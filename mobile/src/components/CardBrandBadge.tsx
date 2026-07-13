import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CardBrand } from '../utils/cardValidation';
import { Theme, useTheme } from '../theme';

export interface CardBrandBadgeProps {
  brand: CardBrand;
  size?: 'sm' | 'lg';
}

/**
 * Deliberately does NOT reproduce the registered Visa/Mastercard logotype artwork
 * (trademark-safe for a portfolio/interview project) — nominative-use text plus a
 * small custom abstract glyph in the brand's associated color.
 */
export function CardBrandBadge({ brand, size = 'sm' }: Readonly<CardBrandBadgeProps>): React.JSX.Element | null {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme, size), [theme, size]);

  if (brand === 'UNKNOWN') {
    return null;
  }

  const config = BRAND_CONFIG[brand];

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]} testID={`card-brand-${brand}`}>
      {brand === 'MASTERCARD' ? (
        <View style={styles.mastercardGlyph}>
          <View style={[styles.circle, styles.circleLeft]} />
          <View style={[styles.circle, styles.circleRight]} />
        </View>
      ) : (
        <View style={styles.visaGlyph} />
      )}
      <Text style={styles.label}>{config.label}</Text>
    </View>
  );
}

const BRAND_CONFIG: Record<Exclude<CardBrand, 'UNKNOWN'>, { backgroundColor: string; label: string }> = {
  VISA: { backgroundColor: 'rgba(255,255,255,0.15)', label: 'VISA' },
  MASTERCARD: { backgroundColor: 'rgba(255,255,255,0.15)', label: 'MC' },
};

const createStyles = (theme: Theme, size: 'sm' | 'lg') =>
  StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: size === 'lg' ? theme.spacing.md : theme.spacing.sm,
      paddingVertical: size === 'lg' ? theme.spacing.xs : theme.spacing.xs / 2,
      borderRadius: theme.radii.sm,
    },
    label: {
      color: theme.colors.white,
      fontSize: size === 'lg' ? theme.typography.sizes.bodySmall : theme.typography.sizes.caption,
      fontWeight: theme.typography.weights.bold,
      letterSpacing: 0.5,
    },
    visaGlyph: {
      width: size === 'lg' ? 14 : 10,
      height: size === 'lg' ? 14 : 10,
      borderRadius: 3,
      backgroundColor: '#F5A623',
      transform: [{ rotate: '20deg' }],
    },
    mastercardGlyph: { flexDirection: 'row' },
    circle: {
      width: size === 'lg' ? 14 : 10,
      height: size === 'lg' ? 14 : 10,
      borderRadius: size === 'lg' ? 7 : 5,
    },
    circleLeft: { backgroundColor: '#EB001B' },
    circleRight: { backgroundColor: '#F79E1B', marginLeft: size === 'lg' ? -6 : -4 },
  });
