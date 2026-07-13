import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { clearCart } from '../features/cart/cartSlice';
import { fetchTransactionStatus, resetTransaction, TransactionStatus } from '../features/transaction/transactionSlice';
import { formatCentsAsCurrency } from '../utils/currency';
import { FALLBACK_STATUS_COPY, STATUS_COPY } from '../utils/transactionStatusCopy';
import { Button } from '../components/Button';
import { StatusAnimation } from '../components/StatusAnimation';
import { Theme, useTheme } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Success'>;

const STATUS_LABELS: Record<TransactionStatus, string> = {
  APPROVED: 'Aprobado',
  PENDING: 'Pendiente',
  DECLINED: 'Rechazado',
  ERROR: 'Algo salió mal',
};

const STATUS_SUBTITLES: Record<TransactionStatus, string> = {
  APPROVED: 'Gracias por tu compra',
  PENDING: 'Recibiras una confirmacion por correo electronico',
  DECLINED: '',
  ERROR: '',
};

const POLL_INTERVAL_MS = 5000;

export function SuccessScreen({ navigation }: Readonly<Props>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useAppDispatch();
  const transaction = useAppSelector((state) => state.transaction.current);

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;

  const [displayStatus, setDisplayStatus] = useState<TransactionStatus>('PENDING');
  const [subtitle, setSubtitle] = useState('Verificando tu pago...');
  const [resolved, setResolved] = useState(false);

  const animateToStatus = (status: TransactionStatus): void => {
    Animated.timing(titleOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setDisplayStatus(status);
      setSubtitle(STATUS_SUBTITLES[status]);
      Animated.timing(titleOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  useEffect(() => {
    if (!transaction) return;

    setDisplayStatus('PENDING');
    setSubtitle('Verificando tu pago...');

    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(cardTranslateY, { toValue: 0, useNativeDriver: true, friction: 8 }),
      ]),
    ]).start();
  }, [transaction, cardOpacity, cardTranslateY]);

  useEffect(() => {
    if (!transaction || resolved) return;
    if (transaction.status !== 'PENDING') {
      animateToStatus(transaction.status);
      setResolved(true);
      return;
    }

    const intervalId = setInterval(() => {
      dispatch(fetchTransactionStatus(transaction.id)).unwrap().then((updated) => {
        if (updated.status !== 'PENDING') {
          setResolved(true);
          animateToStatus(updated.status);
        }
      }).catch(() => {});
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [transaction, resolved, dispatch]);

  const handleBackToHome = (): void => {
    dispatch(clearCart());
    dispatch(resetTransaction());
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const copy = STATUS_COPY[displayStatus] ?? FALLBACK_STATUS_COPY;

  let statusAnimationVariant: 'success' | 'processing' | 'error';
  if (displayStatus === 'APPROVED') {
    statusAnimationVariant = 'success';
  } else if (displayStatus === 'PENDING') {
    statusAnimationVariant = 'processing';
  } else {
    statusAnimationVariant = 'error';
  }

  let titleColor: string;
  if (copy.tone === 'success') {
    titleColor = theme.colors.success;
  } else if (copy.tone === 'warning') {
    titleColor = theme.colors.warning;
  } else {
    titleColor = theme.colors.danger;
  }

  return (
    <View style={styles.container} testID="success-screen">
      <View style={styles.topSection}>
        <StatusAnimation variant={statusAnimationVariant} tone={copy.tone} size={88} />
        <Animated.View style={{ opacity: titleOpacity }}>
          <Text style={[styles.title, { color: titleColor }]}>{STATUS_LABELS[displayStatus]}</Text>
        </Animated.View>
        {subtitle !== '' && (
          <Text style={styles.subtitle}>{subtitle}</Text>
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

      <Button label="Volver a la tienda" onPress={handleBackToHome} testID="back-to-home-button" style={styles.button} />
    </View>
  );
}

function DetailRow({
  theme,
  label,
  value,
  emphasis,
}: Readonly<{ theme: Theme; label: string; value: string; emphasis?: boolean }>): React.JSX.Element {
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
    subtitle: {
      fontSize: theme.typography.sizes.bodySmall,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
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
    button: { width: '100%' },
  });
