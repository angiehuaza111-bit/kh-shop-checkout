import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { Theme, useTheme } from '../theme';

export interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  incrementDisabled?: boolean;
  testIDPrefix: string;
}

export function QuantitySelector({
  quantity,
  onIncrement,
  onDecrement,
  incrementDisabled = false,
  testIDPrefix,
}: Readonly<QuantitySelectorProps>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, styles.minusButton]}
        onPress={onDecrement}
        testID={`decrement-button-${testIDPrefix}`}
      >
        <Minus size={14} color={theme.colors.primary} strokeWidth={2.5} />
      </Pressable>
      <Text style={styles.quantity} testID={`quantity-${testIDPrefix}`}>
        {quantity}
      </Text>
      <Pressable
        style={[styles.button, styles.plusButton, incrementDisabled && styles.buttonDisabled]}
        onPress={onIncrement}
        disabled={incrementDisabled}
        testID={`increment-button-${testIDPrefix}`}
      >
        <Plus size={14} color={incrementDisabled ? theme.colors.textSecondary : theme.colors.white} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    button: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    minusButton: {
      backgroundColor: theme.colors.primaryBg,
    },
    plusButton: {
      backgroundColor: theme.colors.primary,
    },
    buttonDisabled: { opacity: 0.35 },
    quantity: {
      minWidth: 24,
      textAlign: 'center',
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text,
    },
  });
