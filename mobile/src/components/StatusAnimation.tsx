import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react-native';
import { Theme, useTheme } from '../theme';

export type StatusAnimationVariant = 'success' | 'processing' | 'error';
export type StatusAnimationTone = 'primary' | 'success' | 'warning' | 'danger';

export interface StatusAnimationProps {
  variant: StatusAnimationVariant;
  tone?: StatusAnimationTone;
  size?: number;
}

const TONE_TO_COLOR_KEY: Record<StatusAnimationTone, 'primary' | 'success' | 'warning' | 'danger'> = {
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

const TONE_TO_BG_KEY: Record<StatusAnimationTone, 'primaryBg' | 'successBg' | 'warningBg' | 'dangerBg'> = {
  primary: 'primaryBg',
  success: 'successBg',
  warning: 'warningBg',
  danger: 'dangerBg',
};

export function StatusAnimation({
  variant,
  tone,
  size = 72,
}: Readonly<StatusAnimationProps>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const resolvedTone = tone ?? DEFAULT_TONE[variant];
  const color = theme.colors[TONE_TO_COLOR_KEY[resolvedTone]];
  const bgColor = theme.colors[TONE_TO_BG_KEY[resolvedTone]];

  const scale = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const shakeX = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (variant === 'success') {
      scale.setValue(0);
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
        tension: 140,
      }).start();
    }

    if (variant === 'processing') {
      rotation.setValue(0);
      const loop = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      loopRef.current = loop;
      loop.start();
    }

    if (variant === 'error') {
      shakeX.setValue(0);
      Animated.sequence([
        Animated.timing(shakeX, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -4, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 4, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }

    return () => {
      loopRef.current?.stop();
      loopRef.current = null;
    };
  }, [variant, scale, rotation, shakeX]);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const iconSize = size * 0.55;

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      testID={`status-animation-${variant}`}
    >
      <View style={[styles.bgCircle, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }]}>
        {variant === 'success' && (
          <Animated.View style={{ transform: [{ scale }] }}>
            <CheckCircle2 size={iconSize} color={color} strokeWidth={2} />
          </Animated.View>
        )}
        {variant === 'processing' && (
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Loader2 size={iconSize} color={color} strokeWidth={2} />
          </Animated.View>
        )}
        {variant === 'error' && (
          <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
            <XCircle size={iconSize} color={color} strokeWidth={2} />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const DEFAULT_TONE: Record<StatusAnimationVariant, StatusAnimationTone> = {
  success: 'success',
  processing: 'primary',
  error: 'danger',
};

const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center' },
    bgCircle: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
