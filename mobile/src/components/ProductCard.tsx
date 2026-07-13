import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ImageOff, Star } from 'lucide-react-native';
import { Product } from '../features/products/productsSlice';
import { formatCentsAsCurrency } from '../utils/currency';
import { Theme, useTheme } from '../theme';
import { Badge } from './Badge';
import { Button } from './Button';
import { QuantitySelector } from './QuantitySelector';

export interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function ProductCard({
  product,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
}: Readonly<ProductCardProps>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const outOfStock = product.stock <= 0;
  const inStock = !outOfStock;
  const hasDiscount = !!product.discountPercentage && product.discountPercentage > 0;
  const discountedPriceInCents = hasDiscount
    ? Math.round(product.priceInCents * (1 - (product.discountPercentage ?? 0) / 100))
    : product.priceInCents;

  return (
    <View style={styles.card} testID={`product-card-${product.id}`}>
      <View style={styles.imageWrapper}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <ImageOff size={32} color={theme.colors.textSecondary} strokeWidth={1.5} />
          </View>
        )}
        {hasDiscount && (
          <View style={styles.discountBadgeWrapper}>
            <Badge label={`-${product.discountPercentage}%`} tone="danger" testID={`discount-badge-${product.id}`} />
          </View>
        )}
        {outOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Agotado</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        {!!product.category && (
          <Text style={styles.category} numberOfLines={1}>
            {product.category.toUpperCase()}
          </Text>
        )}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        {!!product.description && (
          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>
        )}

        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatCentsAsCurrency(discountedPriceInCents, product.currency)}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>{formatCentsAsCurrency(product.priceInCents, product.currency)}</Text>
            )}
          </View>

          {!!product.rating && (
            <View style={styles.ratingRow} testID={`rating-${product.id}`}>
              <Star size={12} color={theme.colors.warning} fill={theme.colors.warning} />
              <Text style={styles.ratingLabel}>{product.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {inStock && (
          <Badge
            label={`${product.stock} disponible${product.stock === 1 ? '' : 's'}`}
            tone="neutral"
            testID={`stock-badge-${product.id}`}
          />
        )}
      </View>

      <View style={styles.actionSlot}>
        {quantity === 0 ? (
          <Button
            label="Agregar"
            variant="primary"
            shape="pill"
            onPress={onAdd}
            disabled={outOfStock}
            testID={`add-button-${product.id}`}
          />
        ) : (
          <QuantitySelector
            quantity={quantity}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            incrementDisabled={quantity >= product.stock}
            testIDPrefix={product.id}
          />
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.radii.lg,
      marginHorizontal: theme.spacing.lg,
      marginVertical: theme.spacing.xs,
      padding: theme.spacing.md,
      ...theme.shadows.card,
    },
    imageWrapper: { position: 'relative', borderRadius: theme.radii.md, overflow: 'hidden' },
    image: { width: '100%', height: 160, borderRadius: theme.radii.md },
    imagePlaceholder: {
      width: '100%',
      height: 160,
      borderRadius: theme.radii.md,
      backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F1F5F9',
      alignItems: 'center',
      justifyContent: 'center',
    },
    discountBadgeWrapper: { position: 'absolute', top: theme.spacing.sm, left: theme.spacing.sm },
    outOfStockOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: theme.radii.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    outOfStockText: {
      color: theme.colors.white,
      fontWeight: theme.typography.weights.bold,
      fontSize: theme.typography.sizes.bodySmall,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    info: { marginTop: theme.spacing.md, gap: theme.spacing.xs },
    category: {
      fontSize: theme.typography.sizes.caption,
      color: theme.colors.primary,
      fontWeight: theme.typography.weights.semibold,
      letterSpacing: 0.5,
    },
    name: {
      fontSize: theme.typography.sizes.h3,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
      lineHeight: theme.typography.lineHeights.h3,
    },
    description: {
      fontSize: theme.typography.sizes.bodySmall,
      color: theme.colors.textSecondary,
      lineHeight: theme.typography.lineHeights.bodySmall,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.xs,
    },
    priceContainer: { flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing.sm },
    price: {
      fontSize: theme.typography.sizes.h2,
      fontWeight: theme.typography.weights.extrabold,
      color: theme.colors.text,
    },
    originalPrice: {
      fontSize: theme.typography.sizes.bodySmall,
      color: theme.colors.textSecondary,
      textDecorationLine: 'line-through',
    },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    ratingLabel: {
      fontSize: theme.typography.sizes.caption,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.weights.medium,
    },
    actionSlot: { marginTop: theme.spacing.md, alignItems: 'flex-start' },
  });
