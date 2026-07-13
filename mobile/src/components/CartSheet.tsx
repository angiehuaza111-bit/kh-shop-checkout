import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import { CartItem, decrementItem, incrementItem, selectCartTotalInCents, selectCartItemCount } from '../features/cart/cartSlice';
import { useAppDispatch } from '../app/hooks';
import { formatCentsAsCurrency } from '../utils/currency';
import { Theme, useTheme } from '../theme';
import { Backdrop } from './Backdrop';
import { Button } from './Button';
import { PriceSummaryRow } from './PriceSummaryRow';
import { QuantitySelector } from './QuantitySelector';

export interface CartSheetProps {
  visible: boolean;
  onClose: () => void;
  items: CartItem[];
  onCheckout: () => void;
}

export function CartSheet({ visible, onClose, items, onCheckout }: Readonly<CartSheetProps>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useAppDispatch();
  const totalInCents = selectCartTotalInCents(items);
  const itemCount = selectCartItemCount(items);

  if (items.length === 0) {
    return (
      <Backdrop visible={visible} title="Tu carrito" onClose={onClose}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <ShoppingBag size={40} color={theme.colors.textSecondary} strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>Tu carrito esta vacio</Text>
          <Text style={styles.emptySubtitle}>Agrega productos para comenzar</Text>
        </View>
      </Backdrop>
    );
  }

  return (
    <Backdrop visible={visible} title={`Tu carrito (${itemCount})`} onClose={onClose}>
      <ScrollView style={styles.list} testID="cart-sheet-list" showsVerticalScrollIndicator={false}>
        {items.map((item) => (
          <View key={item.productId} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemPrice}>
                {formatCentsAsCurrency(item.priceInCents, item.currency)}
              </Text>
            </View>
            <QuantitySelector
              quantity={item.quantity}
              onIncrement={() => dispatch(incrementItem(item.productId))}
              onDecrement={() => dispatch(decrementItem(item.productId))}
              testIDPrefix={item.productId}
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.summarySection}>
        <PriceSummaryRow label="Subtotal" value={formatCentsAsCurrency(totalInCents)} emphasis />
      </View>

      <Button
        label="Ir a pagar"
        onPress={onCheckout}
        testID="go-to-checkout-button"
        style={styles.checkoutButton}
      />
    </Backdrop>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    list: { maxHeight: 320 },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    itemInfo: { flex: 1, marginRight: theme.spacing.md },
    itemName: {
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.text,
    },
    itemPrice: {
      fontSize: theme.typography.sizes.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    summarySection: {
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    checkoutButton: { marginTop: theme.spacing.md },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
    },
    emptyIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
    },
    emptyTitle: {
      fontSize: theme.typography.sizes.h3,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    emptySubtitle: {
      fontSize: theme.typography.sizes.bodySmall,
      color: theme.colors.textSecondary,
    },
  });
