import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Home, Menu as MenuIcon, ShoppingCart } from 'lucide-react-native';
import { Theme, useTheme } from '../theme';
import { Badge } from './Badge';

export type BottomNavKey = 'home' | 'more';

export interface BottomNavBarProps {
  active: BottomNavKey;
  cartCount: number;
  onNavigate: (key: BottomNavKey) => void;
  onPressCart: () => void;
}

interface NavItemConfig {
  key: BottomNavKey;
  label: string;
  Icon: typeof Home;
}

const LEFT_ITEMS: readonly NavItemConfig[] = [
  { key: 'home', label: 'Inicio', Icon: Home },
];

const RIGHT_ITEMS: readonly NavItemConfig[] = [
  { key: 'more', label: 'Menu', Icon: MenuIcon },
];

export function BottomNavBar({ active, cartCount, onNavigate, onPressCart }: Readonly<BottomNavBarProps>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderItem = (item: NavItemConfig): React.JSX.Element => {
    const isActive = active === item.key;
    const color = isActive ? theme.colors.primary : theme.colors.textSecondary;
    return (
      <Pressable
        key={item.key}
        style={styles.item}
        onPress={() => onNavigate(item.key)}
        testID={`bottom-nav-${item.key}`}
      >
        <item.Icon size={22} color={color} strokeWidth={isActive ? 2.4 : 2} />
        <Text style={[styles.label, { color }]} numberOfLines={1}>
          {item.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.wrapper} pointerEvents="box-none" testID="bottom-nav-bar">
      <View style={styles.bar}>
        {LEFT_ITEMS.map(renderItem)}
        <View style={styles.centerSpacer} />
        {RIGHT_ITEMS.map(renderItem)}
      </View>
      <Pressable style={styles.centerButton} onPress={onPressCart} testID="bottom-nav-cart-center">
        <ShoppingCart size={24} color={theme.colors.white} strokeWidth={2.2} />
        {cartCount > 0 && (
          <View style={styles.centerBadge} testID="bottom-nav-cart-badge">
            <Badge label={String(cartCount)} tone="danger" />
          </View>
        )}
      </Pressable>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      position: 'absolute',
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      bottom: theme.spacing.lg,
      alignItems: 'center',
    },
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      height: 64,
      borderRadius: theme.radii.xl,
      backgroundColor: theme.colors.card,
      paddingHorizontal: theme.spacing.sm,
      ...theme.shadows.floating,
    },
    item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
    centerSpacer: { width: 56 },
    label: {
      fontSize: theme.typography.sizes.caption,
      fontWeight: theme.typography.weights.medium,
    },
    centerButton: {
      position: 'absolute',
      top: -22,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 4,
      borderColor: theme.colors.background,
      ...theme.shadows.floating,
    },
    centerBadge: { position: 'absolute', top: -6, right: -6 },
  });
