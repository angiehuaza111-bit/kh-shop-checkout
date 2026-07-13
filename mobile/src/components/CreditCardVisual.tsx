import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CreditCard } from 'lucide-react-native';
import { CardBrand } from '../utils/cardValidation';
import { Theme, useTheme } from '../theme';
import { CardBrandBadge } from './CardBrandBadge';

export interface CreditCardVisualProps {
  number: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  brand: CardBrand;
  testID?: string;
}

function formatMaskedNumber(rawNumber: string): string {
  const digits = rawNumber.replace(/\s+/g, '');
  const groups: string[] = [];
  for (let i = 0; i < 16; i += 4) {
    const typed = digits.slice(i, i + 4);
    groups.push(typed.length > 0 ? typed.padEnd(4, '\u2022') : '\u2022\u2022\u2022\u2022');
  }
  return groups.join('  ');
}

const BRAND_GRADIENTS: Record<CardBrand, [string, string]> = {
  VISA: ['#1A1F71', '#2D35A0'],
  MASTERCARD: ['#1A1A1A', '#2D2D2D'],
  UNKNOWN: ['#374151', '#4B5563'],
};

export function CreditCardVisual({
  number,
  cardHolder,
  expiryMonth,
  expiryYear,
  brand,
  testID = 'credit-card-visual',
}: Readonly<CreditCardVisualProps>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme, brand), [theme, brand]);

  const holderLabel = cardHolder.trim().length > 0 ? cardHolder.toUpperCase() : 'TU NOMBRE';
  const expiryLabel = expiryMonth || expiryYear ? `${expiryMonth || 'MM'}/${expiryYear || 'YY'}` : 'MM/YY';

  return (
    <View style={styles.card} testID={testID}>
      <View style={styles.topRow}>
        <View style={styles.chipContainer}>
          <View style={styles.chipLine} />
          <View style={[styles.chipLine, { marginTop: 4 }]} />
        </View>
        <CardBrandBadge brand={brand} size="lg" />
      </View>

      <Text style={styles.number}>{formatMaskedNumber(number)}</Text>

      <View style={styles.bottomRow}>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Titular</Text>
          <Text style={styles.fieldValue} numberOfLines={1}>
            {holderLabel}
          </Text>
        </View>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Vence</Text>
          <Text style={styles.fieldValue}>{expiryLabel}</Text>
        </View>
        <View style={styles.fieldContainer}>
          <CreditCard size={20} color="rgba(255,255,255,0.3)" />
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme, brand: CardBrand) => {
  const [bg1] = BRAND_GRADIENTS[brand];
  return StyleSheet.create({
    card: {
      borderRadius: theme.radii.xl,
      padding: theme.spacing.lg,
      aspectRatio: 1.586,
      justifyContent: 'space-between',
      backgroundColor: bg1,
      ...theme.shadows.floating,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    chipContainer: {
      width: 44,
      height: 32,
      borderRadius: theme.radii.sm,
      backgroundColor: 'rgba(255,255,255,0.15)',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    chipLine: {
      height: 2,
      backgroundColor: 'rgba(255,255,255,0.3)',
      borderRadius: 1,
    },
    number: {
      color: theme.colors.white,
      fontSize: theme.typography.sizes.h2,
      fontWeight: theme.typography.weights.semibold,
      letterSpacing: 3,
      marginTop: theme.spacing.sm,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    fieldContainer: {
      flex: 1,
    },
    fieldLabel: {
      color: 'rgba(255,255,255,0.45)',
      fontSize: theme.typography.sizes.caption,
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    fieldValue: {
      color: theme.colors.white,
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.semibold,
      maxWidth: 140,
    },
  });
};
