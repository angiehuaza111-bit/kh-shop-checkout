import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Theme, useTheme } from '../theme';

export type PriceSummaryRowTone = 'default' | 'muted' | 'success';

export interface PriceSummaryRowProps {
  label: string;
  value: string;
  emphasis?: boolean;
  tone?: PriceSummaryRowTone;
  testID?: string;
}

export function PriceSummaryRow({
  label,
  value,
  emphasis = false,
  tone = 'default',
  testID,
}: Readonly<PriceSummaryRowProps>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.row, emphasis && styles.rowEmphasis]} testID={testID}>
      <Text style={[styles.label, emphasis && styles.labelEmphasis]}>{label}</Text>
      <Text style={[styles.value, emphasis && styles.valueEmphasis, styles[`${tone}Value` as const]]}>
        {value}
      </Text>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    rowEmphasis: {
      paddingVertical: theme.spacing.md,
    },
    label: {
      fontSize: theme.typography.sizes.body,
      color: theme.colors.textSecondary,
    },
    labelEmphasis: {
      fontSize: theme.typography.sizes.h3,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
    },
    value: {
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.text,
    },
    valueEmphasis: {
      fontSize: theme.typography.sizes.h2,
      fontWeight: theme.typography.weights.extrabold,
    },
    defaultValue: {},
    mutedValue: { color: theme.colors.textSecondary, fontWeight: theme.typography.weights.regular },
    successValue: { color: theme.colors.success },
  });
