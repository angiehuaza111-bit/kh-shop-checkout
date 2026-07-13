import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Theme, useTheme } from '../theme';

export type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  testID?: string;
}

export function Badge({ label, tone = 'neutral', testID }: Readonly<BadgeProps>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.base, styles[tone]]} testID={testID}>
      <Text style={[styles.label, styles[`${tone}Text` as const]]}>{label}</Text>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      alignSelf: 'flex-start',
      borderRadius: theme.radii.pill,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs / 2,
    },
    label: {
      fontSize: theme.typography.sizes.caption,
      fontWeight: theme.typography.weights.semibold,
    },
    primary: { backgroundColor: theme.colors.primaryBg },
    primaryText: { color: theme.colors.primary },
    success: { backgroundColor: theme.colors.successBg },
    successText: { color: theme.colors.success },
    warning: { backgroundColor: theme.colors.warningBg },
    warningText: { color: theme.colors.warning },
    danger: { backgroundColor: theme.colors.dangerBg },
    dangerText: { color: theme.colors.danger },
    neutral: { backgroundColor: theme.colors.border },
    neutralText: { color: theme.colors.textSecondary },
  });
