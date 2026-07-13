import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectCartTotalInCents } from '../features/cart/cartSlice';
import { createTransaction, TransactionStatus } from '../features/transaction/transactionSlice';
import { CardTokenizationError, tokenizeCard } from '../features/paymentGateway/tokenizeCard';
import { Backdrop } from '../components/Backdrop';
import { CreditCardForm, CreditCardFormSubmitValues } from '../components/CreditCardForm';
import { CreditCardVisual } from '../components/CreditCardVisual';
import { Button } from '../components/Button';
import { StatusAnimation } from '../components/StatusAnimation';
import { Toast } from '../components/Toast';
import { CardFormValues, detectCardBrand } from '../utils/cardValidation';
import { formatCentsAsCurrency } from '../utils/currency';
import { Theme, useTheme } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

const EMPTY_CARD_PREVIEW: CardFormValues = { number: '', cardHolder: '', expiryMonth: '', expiryYear: '', cvc: '' };

const SUCCESS_STATUSES: Set<TransactionStatus> = new Set(['APPROVED', 'PENDING']);

export function PaymentScreen({ navigation }: Readonly<Props>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const totalInCents = selectCartTotalInCents(cartItems);

  const [cardPreview, setCardPreview] = useState<CardFormValues>(EMPTY_CARD_PREVIEW);
  const [isSummaryVisible, setSummaryVisible] = useState(false);
  const [pendingCard, setPendingCard] = useState<CreditCardFormSubmitValues | null>(null);
  const [isPaying, setPaying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCardSubmit = (values: CreditCardFormSubmitValues): void => {
    setPendingCard(values);
    setSummaryVisible(true);
  };

  const handlePay = async (): Promise<void> => {
    if (!pendingCard) {
      return;
    }
    setPaying(true);
    try {
      const cardToken = await tokenizeCard(pendingCard);
      const transaction = await dispatch(
        createTransaction({
          items: cartItems,
          customerEmail: pendingCard.customerEmail,
          cardToken,
        }),
      ).unwrap();

      setSummaryVisible(false);
      if (SUCCESS_STATUSES.has(transaction.status)) {
        navigation.replace('Success');
      } else {
        navigation.replace('Failure');
      }
    } catch (error) {
      const message =
        error instanceof CardTokenizationError || error instanceof Error
          ? error.message
          : 'El pago no pudo ser procesado. Por favor, intentelo de nuevo.';
      setToastMessage(message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <View style={styles.container} testID="payment-screen">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <CreditCardVisual
          number={cardPreview.number}
          cardHolder={cardPreview.cardHolder}
          expiryMonth={cardPreview.expiryMonth}
          expiryYear={cardPreview.expiryYear}
          brand={detectCardBrand(cardPreview.number)}
        />

        <Text style={styles.sectionTitle}>Datos de la tarjeta</Text>
        <CreditCardForm onSubmit={handleCardSubmit} onValuesChange={setCardPreview} />
      </ScrollView>

      <Backdrop
        visible={isSummaryVisible}
        title="Confirmar pago"
        onClose={() => !isPaying && setSummaryVisible(false)}
      >
        {pendingCard && (
          <View>
            {isPaying ? (
              <View style={styles.processingWrapper} testID="payment-processing">
                <StatusAnimation variant="processing" tone="primary" size={64} />
                <Text style={styles.processingLabel}>Procesando tu pago...</Text>
                <Text style={styles.processingSublabel}>No cierres la aplicacion</Text>
              </View>
            ) : (
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total a pagar</Text>
                  <Text style={styles.summaryTotal}>{formatCentsAsCurrency(totalInCents)}</Text>
                </View>
              </View>
            )}

            <Button
              label={isPaying ? '' : `Pagar ${formatCentsAsCurrency(totalInCents)}`}
              onPress={handlePay}
              loading={isPaying}
              disabled={isPaying}
              testID="confirm-pay-button"
              style={styles.payButton}
            />
          </View>
        )}
      </Backdrop>

      <Toast message={toastMessage} onHide={() => setToastMessage(null)} />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
    sectionTitle: {
      fontSize: theme.typography.sizes.h3,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.md,
    },
    summaryCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLabel: {
      fontSize: theme.typography.sizes.body,
      color: theme.colors.textSecondary,
    },
    summaryTotal: {
      fontSize: theme.typography.sizes.h2,
      fontWeight: theme.typography.weights.extrabold,
      color: theme.colors.text,
    },
    payButton: { marginTop: theme.spacing.sm },
    processingWrapper: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
    },
    processingLabel: {
      marginTop: theme.spacing.lg,
      color: theme.colors.text,
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.semibold,
    },
    processingSublabel: {
      marginTop: theme.spacing.xs,
      color: theme.colors.textSecondary,
      fontSize: theme.typography.sizes.bodySmall,
    },
  });
