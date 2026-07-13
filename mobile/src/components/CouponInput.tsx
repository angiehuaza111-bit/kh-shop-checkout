import React, { useMemo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Ticket, Check } from 'lucide-react-native';
import { Theme, useTheme } from '../theme';
import { Button } from './Button';

export interface CouponInputProps {
  value: string;
  onChangeText: (value: string) => void;
  onApply: () => void;
  appliedLabel?: string | null;
  error?: string | null;
}

/**
 * There is no coupon field anywhere in the backend/transaction contract, so this is
 * intentionally decorative — it always resolves to "invalid code" rather than
 * computing a fake discount that could diverge from the amount actually charged.
 */
export function CouponInput({
  value,
  onChangeText,
  onApply,
  appliedLabel,
  error,
}: Readonly<CouponInputProps>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (appliedLabel) {
    return (
      <View style={[styles.row, styles.appliedRow]} testID="coupon-applied">
        <View style={styles.appliedIcon}>
          <Check size={14} color={theme.colors.success} />
        </View>
        <Text style={styles.appliedLabel}>{appliedLabel}</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.iconWrapper}>
          <Ticket size={16} color={theme.colors.textSecondary} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Tienes un cupon?"
          placeholderTextColor={theme.colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="characters"
          testID="coupon-input"
        />
        <Button label="Aplicar" variant="outline" onPress={onApply} testID="coupon-apply-button" style={styles.applyButton} />
      </View>
      {!!error && (
        <Text style={styles.error} testID="coupon-error">
          {error}
        </Text>
      )}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    input: {
      flex: 1,
      color: theme.colors.text,
      fontSize: theme.typography.sizes.body,
      paddingVertical: theme.spacing.sm,
    },
    iconWrapper: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
      alignItems: 'center',
      justifyContent: 'center',
    },
    applyButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    appliedRow: {
      backgroundColor: theme.colors.successBg,
      borderRadius: theme.radii.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    appliedIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.success,
      alignItems: 'center',
      justifyContent: 'center',
    },
    appliedLabel: {
      color: theme.colors.success,
      fontWeight: theme.typography.weights.semibold,
      fontSize: theme.typography.sizes.bodySmall,
    },
    error: {
      color: theme.colors.danger,
      fontSize: theme.typography.sizes.caption,
      marginTop: theme.spacing.xs,
      marginLeft: 44,
    },
  });
