import React, { ReactNode, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { Theme, useTheme } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonShape = 'rect' | 'pill' | 'circle';

export interface ButtonProps {
  label?: string;
  children?: ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  shape?: ButtonShape;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

const PRESS_SCALE = 0.96;

export function Button({
  label,
  children,
  onPress,
  variant = 'primary',
  shape = 'rect',
  disabled = false,
  loading = false,
  testID,
  style,
}: Readonly<ButtonProps>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const handlePressIn = (): void => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: PRESS_SCALE,
        useNativeDriver: true,
        speed: 40,
        bounciness: 0,
      }),
      Animated.timing(opacity, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = (): void => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const variantStyle = styles[variant];
  let shapeStyle;

  if (shape === 'pill') {
    shapeStyle = styles.pill;
  } else if (shape === 'circle') {
    shapeStyle = styles.circle;
  } else {
    shapeStyle = styles.rect;
  }

  const textVariantStyle = styles[`${variant}Text` as const];
  const activityIndicatorColor = variant === 'primary' ? theme.colors.white : theme.colors.primary;

  const content: ReactNode = loading
    ? <ActivityIndicator color={activityIndicatorColor} size="small" />
    : children
      ? children
      : <Text style={[styles.label, textVariantStyle]}>{label}</Text>;

  return (
    <Animated.View style={[{ transform: [{ scale }], opacity }, isDisabled && styles.disabledWrapper]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        testID={testID}
        style={[styles.base, variantStyle, shapeStyle, style]}
      >
        {content}
      </Pressable>
    </Animated.View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    rect: { borderRadius: theme.radii.md },
    pill: { borderRadius: theme.radii.pill },
    circle: {
      width: 52,
      height: 52,
      borderRadius: theme.radii.pill,
      paddingHorizontal: 0,
      paddingVertical: 0,
    },
    disabledWrapper: { opacity: 0.4 },
    label: {
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.bold,
      letterSpacing: 0.2,
    },
    primary: {
      backgroundColor: theme.colors.primary,
      ...theme.shadows.floating,
    },
    primaryText: { color: theme.colors.white },
    secondary: {
      backgroundColor: theme.colors.primaryBg,
    },
    secondaryText: { color: theme.colors.primary },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    outlineText: { color: theme.colors.primary },
    ghost: { backgroundColor: 'transparent' },
    ghostText: { color: theme.colors.textSecondary },
  });
