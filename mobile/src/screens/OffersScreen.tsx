import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ticket } from 'lucide-react-native';
import { Theme, useTheme } from '../theme';

export function OffersScreen(): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container} testID="offers-screen">
      <View style={styles.iconCircle}>
        <Ticket size={32} color={theme.colors.primary} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>Cupones y ofertas</Text>
      <Text style={styles.subtitle}>Muy pronto encontraras aqui promociones y descuentos exclusivos.</Text>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.colors.primaryBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: theme.typography.sizes.h3,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: theme.typography.sizes.bodySmall,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
    },
  });
