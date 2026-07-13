import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { clearCart } from '../features/cart/cartSlice';
import { resetTransaction } from '../features/transaction/transactionSlice';
import { formatCentsAsCurrency } from '../utils/currency';
import { FALLBACK_STATUS_COPY, STATUS_COPY } from '../utils/transactionStatusCopy';
import { Button } from '../components/Button';
import { StatusAnimation } from '../components/StatusAnimation';
import { Theme, useTheme } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Failure'>;

export function FailureScreen({ navigation }: Readonly<Props>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useAppDispatch();
  const transaction = useAppSelector((state) => state.transaction.current);

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(cardTranslateY, { toValue: 0, useNativeDriver: true, friction: 8 }),
      ]),
    ]).start();
  }, [cardOpacity, cardTranslateY]);

  const handleBackToHome = (): void => {
    dispatch(clearCart());
    dispatch(resetTransaction());
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const copy = transaction ? STATUS_COPY[transaction.status] : FALLBACK_STATUS_COPY;

  return (
    <View style={styles.container} testID="failure-screen">
      <View style={styles.topSection}>
        <StatusAnimation variant="error" tone={copy.tone} size={88} />
        <Text style={[styles.title, { color: theme.colors.danger }]}>
          {copy.title}
        </Text>
        {transaction?.failureReason && (
          <Text style={styles.reason}>{transaction.failureReason}</Text>
        )}
      </View>

      {transaction && (
        <Animated.View style={[styles.details, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }]}>
          <DetailRow theme={theme} label="Referencia" value={transaction.reference} />
          <View style={styles.detailDivider} />
          <DetailRow
            theme={theme}
            label="Monto"
            value={formatCentsAsCurrency(transaction.amountInCents, transaction.currency)}
            emphasis
          />
          {transaction.cardBrand && transaction.cardLastFour && (
            <>
              <View style={styles.detailDivider} />
              <DetailRow theme={theme} label="Tarjeta" value={`${transaction.cardBrand} **** ${transaction.cardLastFour}`} />
            </>
          )}
        </Animated.View>
      )}

      <View>
        <Button
          label="Intentar de nuevo"
          variant="secondary"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Payment' }] })}
          testID="retry-button"
          style={styles.retryButton}
        />
        <Button label="Volver a la tienda" onPress={handleBackToHome} testID="back-to-home-button" style={styles.button} />
      </View>
    </View>
  );
}

function DetailRow(props: Readonly<{ theme: Theme; label: string; value: string; emphasis?: boolean }>): React.JSX.Element {
  const { theme, label, value, emphasis } = props;
  const styles = createStyles(theme);
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, emphasis && styles.detailValueEmphasis]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
      justifyContent: 'space-between',
    },
    topSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: theme.spacing.xxl,
    },
    title: {
      fontSize: theme.typography.sizes.h1,
      fontWeight: theme.typography.weights.extrabold,
      textAlign: 'center',
      marginTop: theme.spacing.lg,
      letterSpacing: -0.3,
    },
    reason: {
      fontSize: theme.typography.sizes.bodySmall,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
    },
    details: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.card,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    detailLabel: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.sizes.body,
    },
    detailValue: {
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.text,
      fontSize: theme.typography.sizes.body,
      maxWidth: '60%',
      textAlign: 'right',
    },
    detailValueEmphasis: {
      fontSize: theme.typography.sizes.h3,
      fontWeight: theme.typography.weights.extrabold,
    },
    detailDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
    },
    retryButton: { width: '100%', marginBottom: theme.spacing.sm },
    button: { width: '100%' },
  });
