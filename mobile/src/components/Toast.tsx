import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Theme, useTheme } from '../theme';

export interface ToastProps {
  message: string | null;
  onHide: () => void;
  durationMs?: number;
}

export function Toast({ message, onHide, durationMs = 3000 }: Readonly<ToastProps>): React.JSX.Element | null {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    opacity.setValue(0);
    translateY.setValue(20);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8 }),
    ]).start();

    const timer = setTimeout(onHide, durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs, onHide, opacity, translateY]);

  if (!message) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.container, { opacity, transform: [{ translateY }] }]}
      testID="toast"
    >
      <View style={styles.iconWrapper}>
        <AlertCircle size={18} color="#F87171" />
      </View>
      <Text style={styles.text} numberOfLines={2}>{message}</Text>
    </Animated.View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      bottom: theme.spacing.xl,
      backgroundColor: theme.mode === 'dark' ? '#1E293B' : '#FFFFFF',
      borderRadius: theme.radii.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.mode === 'dark' ? 'rgba(248,113,113,0.2)' : '#FEE2E2',
      ...theme.shadows.floating,
    },
    iconWrapper: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.mode === 'dark' ? 'rgba(248,113,113,0.15)' : '#FEE2E2',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    text: {
      flex: 1,
      color: theme.colors.text,
      fontSize: theme.typography.sizes.bodySmall,
      lineHeight: theme.typography.lineHeights.bodySmall,
    },
  });
