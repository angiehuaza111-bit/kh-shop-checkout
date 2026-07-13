import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import { useThemeContext } from '../theme/ThemeContext';
import { Theme, useTheme } from '../theme';
import { Button } from '../components/Button';

export function MoreScreen(): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { isDark, toggleTheme } = useThemeContext();

  return (
    <View style={styles.container} testID="more-screen">
      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>Tema oscuro</Text>
          <Text style={styles.rowSubtitle}>{isDark ? 'Activado' : 'Desactivado'}</Text>
        </View>
        <Button
          variant="secondary"
          shape="circle"
          onPress={toggleTheme}
          testID="more-theme-toggle"
          style={styles.toggleButton}
        >
          {isDark ? <Sun size={20} color={theme.colors.primary} /> : <Moon size={20} color={theme.colors.primary} />}
        </Button>
      </View>

      <View style={styles.footer}>
        <Text style={styles.appName}>KH Shop</Text>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.card,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg,
      ...theme.shadows.card,
    },
    rowText: { flex: 1, marginRight: theme.spacing.md },
    rowTitle: {
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.text,
    },
    rowSubtitle: {
      fontSize: theme.typography.sizes.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    toggleButton: { width: 44, height: 44 },
    footer: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: theme.spacing.xl },
    appName: {
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.textSecondary,
    },
    appVersion: {
      fontSize: theme.typography.sizes.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
  });
