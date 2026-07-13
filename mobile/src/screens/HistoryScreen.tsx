import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Clock } from 'lucide-react-native';
import { useAppSelector } from '../app/hooks';
import { formatCentsAsCurrency } from '../utils/currency';
import { FALLBACK_STATUS_COPY, STATUS_COPY } from '../utils/transactionStatusCopy';
import { Badge, BadgeTone } from '../components/Badge';
import { Theme, useTheme } from '../theme';

const TONE_TO_BADGE: Record<string, BadgeTone> = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

export function HistoryScreen(): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const transaction = useAppSelector((state) => state.transaction.current);

  if (!transaction) {
    return (
      <View style={styles.emptyContainer} testID="history-screen">
        <View style={styles.emptyIconCircle}>
          <Clock size={32} color={theme.colors.textSecondary} strokeWidth={1.5} />
        </View>
        <Text style={styles.emptyTitle}>Aun no tienes transacciones</Text>
        <Text style={styles.emptySubtitle}>Cuando realices una compra, aparecera aqui.</Text>
      </View>
    );
  }

  const copy = STATUS_COPY[transaction.status] ?? FALLBACK_STATUS_COPY;

  return (
    <View style={styles.container} testID="history-screen">
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.reference} numberOfLines={1}>
            {transaction.reference}
          </Text>
          <Badge label={copy.title} tone={TONE_TO_BADGE[copy.tone] ?? 'neutral'} />
        </View>
        <Text style={styles.amount}>{formatCentsAsCurrency(transaction.amountInCents, transaction.currency)}</Text>
        {transaction.cardBrand && transaction.cardLastFour && (
          <Text style={styles.cardInfo}>
            {transaction.cardBrand} **** {transaction.cardLastFour}
          </Text>
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg },
    emptyContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    emptyIconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
    },
    emptyTitle: {
      fontSize: theme.typography.sizes.h3,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: theme.typography.sizes.bodySmall,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg,
      ...theme.shadows.card,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    reference: {
      fontSize: theme.typography.sizes.bodySmall,
      color: theme.colors.textSecondary,
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    amount: {
      fontSize: theme.typography.sizes.h1,
      fontWeight: theme.typography.weights.extrabold,
      color: theme.colors.text,
    },
    cardInfo: {
      fontSize: theme.typography.sizes.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
  });
