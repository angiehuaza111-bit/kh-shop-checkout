import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch } from '../app/hooks';
import { fetchProducts } from '../features/products/productsSlice';
import { StatusAnimation } from '../components/StatusAnimation';
import { Logo } from '../components/Logo';
import { Theme, useTheme } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const MINIMUM_SPLASH_MS = 1200;

export function SplashScreen({ navigation }: Readonly<Props>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useAppDispatch();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.6)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconTranslateY = useRef(new Animated.Value(20)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 80 }),
      ]),
      Animated.parallel([
        Animated.timing(iconOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(iconTranslateY, { toValue: 0, useNativeDriver: true, friction: 8 }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(titleTranslateY, { toValue: 0, useNativeDriver: true, friction: 8 }),
      ]),
    ]).start();
  }, [opacity, scale, iconOpacity, iconTranslateY, titleOpacity, titleTranslateY]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap(): Promise<void> {
      const start = Date.now();
      await dispatch(fetchProducts());
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MINIMUM_SPLASH_MS - elapsed);
      setTimeout(() => {
        if (!cancelled) {
          navigation.replace('Home');
        }
      }, remaining);
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [dispatch, navigation]);

  return (
    <View style={styles.container} testID="splash-screen">
      <View style={styles.content}>
        <Animated.View style={{ opacity, transform: [{ scale }] }}>
          <Logo size={100} variant="icon" />
        </Animated.View>

        <Animated.View
          style={{
            opacity: iconOpacity,
            transform: [{ translateY: iconTranslateY }],
            alignItems: 'center',
            marginTop: theme.spacing.xl,
          }}
        >
          <Logo size={160} variant="full" />
        </Animated.View>

        <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleTranslateY }], marginTop: theme.spacing.xxl }}>
          <StatusAnimation variant="processing" tone="primary" size={32} />
        </Animated.View>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.mode === 'dark' ? theme.colors.background : '#0F172A',
    },
    content: {
      alignItems: 'center',
    },
  });
