import React, { Component, ErrorInfo, PropsWithChildren, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Theme, useTheme } from '../theme';
import { Button } from './Button';

interface State {
  hasError: boolean;
}

function ErrorBoundaryFallback({ onRetry }: Readonly<{ onRetry: () => void }>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container} testID="error-boundary-fallback">
      <Text style={styles.title}>Algo salió mal</Text>
      <Button label="Intentar de nuevo" onPress={onRetry} testID="error-boundary-retry" />
    </View>
  );
}

/**
 * Last line of defense against the "no crashes allowed" requirement: catches render
 * errors anywhere in the tree and shows a recoverable fallback instead of a crash.
 * Stays a class component (required for getDerivedStateFromError/componentDidCatch)
 * and delegates the themed fallback UI to a function component so it can use hooks.
 */
export class ErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error', error, info.componentStack);
  }

  private readonly handleReset = (): void => {
    this.setState({ hasError: false });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return <ErrorBoundaryFallback onRetry={this.handleReset} />;
    }
    return this.props.children;
  }
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: theme.typography.sizes.h3,
      fontWeight: theme.typography.weights.bold,
      marginBottom: theme.spacing.md,
      color: theme.colors.text,
    },
  });
