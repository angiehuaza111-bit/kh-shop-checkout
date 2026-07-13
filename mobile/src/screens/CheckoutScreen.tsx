import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppSelector } from '../app/hooks';
import { selectCartTotalInCents, selectCartItemCount } from '../features/cart/cartSlice';
import { formatCentsAsCurrency } from '../utils/currency';
import { Button } from '../components/Button';
import { PriceSummaryRow } from '../components/PriceSummaryRow';
import { Theme, useTheme } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation }: Readonly<Props>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const cartItems = useAppSelector((state) => state.cart.items);
  const totalInCents = selectCartTotalInCents(cartItems);
  const itemCount = selectCartItemCount(cartItems);

  return (
    <View style={styles.container} testID="checkout-screen">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Resumen del pedido</Text>

        <View style={styles.itemsCard}>
          {cartItems.map((item, index) => (
            <View key={item.productId}>
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemQty}>x{item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>
                  {formatCentsAsCurrency(item.priceInCents * item.quantity, item.currency)}
                </Text>
              </View>
              {index < cartItems.length - 1 && <View style={styles.itemDivider} />}
            </View>
          ))}
        </View>

        <View style={styles.summaryCard}>
          <PriceSummaryRow label="Subtotal" value={formatCentsAsCurrency(totalInCents)} />
          <PriceSummaryRow label="Envio" value="Gratis" tone="success" />
          <PriceSummaryRow label="Impuestos" value="Incluidos" tone="muted" />
          <View style={styles.divider} />
          <PriceSummaryRow
            label="Total"
            value={formatCentsAsCurrency(totalInCents)}
            emphasis
            testID="checkout-total"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerItems}>{itemCount} articulo{itemCount === 1 ? '' : 's'}</Text>
          <Text style={styles.footerTotal}>{formatCentsAsCurrency(totalInCents)}</Text>
        </View>
        <Button
          label="Continuar al pago"
          onPress={() => navigation.navigate('Payment')}
          testID="pay-with-card-button"
          style={styles.continueButton}
        />
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.lg, paddingBottom: 140 },
    header: {
      fontSize: theme.typography.sizes.h2,
      fontWeight: theme.typography.weights.extrabold,
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
      letterSpacing: -0.3,
    },
    itemsCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      ...theme.shadows.card,
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    itemInfo: { flex: 1, marginRight: theme.spacing.md },
    itemName: {
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.text,
    },
    itemQty: {
      fontSize: theme.typography.sizes.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    itemPrice: {
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.text,
    },
    itemDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
    },
    summaryCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      ...theme.shadows.card,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.xs,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.card,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      ...theme.shadows.floating,
    },
    footerInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    footerItems: {
      fontSize: theme.typography.sizes.bodySmall,
      color: theme.colors.textSecondary,
    },
    footerTotal: {
      fontSize: theme.typography.sizes.h2,
      fontWeight: theme.typography.weights.extrabold,
      color: theme.colors.text,
    },
    continueButton: { width: '100%' },
  });
