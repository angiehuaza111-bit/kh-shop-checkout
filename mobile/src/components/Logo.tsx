import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';

export interface LogoProps {
  size?: number;
  variant?: 'icon' | 'full';
}

export function Logo({ size = 48, variant = 'full' }: Readonly<LogoProps>): React.JSX.Element {
  const iconSize = Math.round(size * 0.45);
  const fontSize = Math.round(size * 0.28);
  const subFontSize = Math.round(size * 0.14);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: Math.max(1, Math.round(size * 0.03)),
          },
        ]}
      >
        <ShoppingBag size={iconSize} color="#FFFFFF" strokeWidth={1.5} />
      </View>
      {variant === 'full' && (
        <View style={styles.textBlock}>
          <Text style={[styles.title, { fontSize }]}>KH Shop</Text>
          <Text style={[styles.subtitle, { fontSize: subFontSize }]}>Kevin Huaza Shop</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
  },
  title: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
