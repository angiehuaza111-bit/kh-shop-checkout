import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Search, ShoppingCart, Sun, Moon } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addProduct, decrementItem, incrementItem, selectCartItemCount } from '../features/cart/cartSlice';
import { fetchProducts, Product } from '../features/products/productsSlice';
import { ProductCard } from '../components/ProductCard';
import { CartSheet } from '../components/CartSheet';
import { BottomNavBar, BottomNavKey } from '../components/BottomNavBar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Theme, useTheme } from '../theme';
import { useThemeContext } from '../theme/ThemeContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeProductsScreen({ navigation }: Readonly<Props>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);
  const status = useAppSelector((state) => state.products.status);
  const cartItems = useAppSelector((state) => state.cart.items);
  const [isCartVisible, setCartVisible] = useState(false);
  const [search, setSearch] = useState('');
  const { isDark, toggleTheme } = useThemeContext();

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchProducts());
    }, [dispatch]),
  );

  const quantityFor = (productId: string): number =>
    cartItems.find((item) => item.productId === productId)?.quantity ?? 0;

  const itemCount = selectCartItemCount(cartItems);

  const handleBottomNavigate = (key: BottomNavKey): void => {
    if (key === 'more') {
      navigation.navigate('More');
    }
  };

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        !!p.description?.toLowerCase().includes(q) ||
        !!p.category?.toLowerCase().includes(q),
    );
  }, [products, search]);

  const renderItem = ({ item }: { item: Product }): React.JSX.Element => (
    <ProductCard
      product={item}
      quantity={quantityFor(item.id)}
      onAdd={() => dispatch(addProduct(item))}
      onIncrement={() => dispatch(incrementItem(item.id))}
      onDecrement={() => dispatch(decrementItem(item.id))}
    />
  );

  const renderHeader = (): React.JSX.Element => (
    <View>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Bienvenido a</Text>
          <Text style={styles.header}>KH Shop</Text>
        </View>
        <View style={styles.headerActions}>
          <Button
            variant="secondary"
            shape="circle"
            onPress={toggleTheme}
            style={styles.themeToggle}
          >
            {isDark ? (
              <Sun size={20} color={theme.colors.primary} />
            ) : (
              <Moon size={20} color={theme.colors.primary} />
            )}
          </Button>
          <View style={styles.cartButtonWrapper}>
            <Button
              variant="secondary"
              shape="circle"
              onPress={() => setCartVisible(true)}
              testID="cart-fab-button"
              style={styles.cartButton}
            >
              <ShoppingCart size={22} color={theme.colors.primary} />
            </Button>
            {itemCount > 0 && (
              <View style={styles.cartBadge} testID="cart-fab-badge">
                <Badge label={String(itemCount)} tone="danger" />
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={18} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar productos..."
          placeholderTextColor={theme.colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          testID="search-input"
        />
      </View>

      <Text style={styles.sectionTitle}>Productos</Text>
    </View>
  );

  let listContent: React.JSX.Element;
  if (status === 'loading' && products.length === 0) {
    listContent = (
      <View style={styles.centered}>
        <Text style={styles.message}>Cargando productos...</Text>
      </View>
    );
  } else if (status === 'failed') {
    listContent = (
      <View style={styles.centered}>
        <Text style={styles.message}>No se pudo cargar el catálogo. Desliza para reintentar.</Text>
      </View>
    );
  } else {
    listContent = (
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        testID="products-list"
      />
    );
  }

  return (
    <View style={styles.container} testID="home-screen">
      {listContent}

      <CartSheet
        visible={isCartVisible}
        onClose={() => setCartVisible(false)}
        items={cartItems}
        onCheckout={() => {
          setCartVisible(false);
          navigation.navigate('Checkout');
        }}
      />

      <BottomNavBar
        active="home"
        cartCount={itemCount}
        onNavigate={handleBottomNavigate}
        onPressCart={() => setCartVisible(true)}
      />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
    },
    greeting: {
      fontSize: theme.typography.sizes.bodySmall,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.weights.medium,
      marginBottom: 2,
    },
    header: {
      fontSize: theme.typography.sizes.h1,
      fontWeight: theme.typography.weights.extrabold,
      color: theme.colors.text,
      letterSpacing: -0.5,
    },
    cartButtonWrapper: { position: 'relative' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    themeToggle: { width: 44, height: 44 },
    cartButton: { width: 48, height: 48 },
    cartBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: theme.radii.md,
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      height: 48,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchIcon: { marginRight: theme.spacing.sm },
    searchInput: {
      flex: 1,
      fontSize: theme.typography.sizes.body,
      color: theme.colors.text,
      paddingVertical: 0,
    },
    sectionTitle: {
      fontSize: theme.typography.sizes.bodySmall,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    message: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      fontSize: theme.typography.sizes.body,
    },
    list: { paddingBottom: theme.spacing.xxl * 2 + 64 },
  });
