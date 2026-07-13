import React, { PropsWithChildren, useEffect, useMemo, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { Theme, useTheme } from '../theme';

export interface BackdropProps {
  visible: boolean;
  title: string;
  onClose?: () => void;
}

/**
 * Material "Backdrop" pattern: a dim scrim over the current screen with a rounded
 * sheet sliding up from the bottom that reveals contextual content.
 */
export function Backdrop({
  visible,
  title,
  onClose,
  children,
}: PropsWithChildren<BackdropProps>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const scrimOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scrimOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 65,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scrimOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(sheetTranslateY, { toValue: 400, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, scrimOpacity, sheetTranslateY]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} testID="backdrop-modal">
      <Animated.View style={[styles.scrim, { opacity: scrimOpacity }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          testID="backdrop-scrim-dismiss"
          accessibilityLabel="Close"
        />
      </Animated.View>
      <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}>
        <View style={styles.handleRow}>
          <View style={styles.handle} />
          {onClose && (
            <Pressable onPress={onClose} style={styles.closeButton} testID="backdrop-close">
              <X size={20} color={theme.colors.textSecondary} />
            </Pressable>
          )}
        </View>
        <Text style={styles.title}>{title}</Text>
        {children}
      </Animated.View>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    scrim: {
      ...StyleSheet.absoluteFill,
      backgroundColor: theme.colors.overlay,
    },
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.card,
      borderTopLeftRadius: theme.radii.xl,
      borderTopRightRadius: theme.radii.xl,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xl,
      maxHeight: '85%',
      ...theme.shadows.modal,
    },
    handleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
      position: 'relative',
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
    },
    closeButton: {
      position: 'absolute',
      right: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: theme.typography.sizes.h3,
      fontWeight: theme.typography.weights.bold,
      marginBottom: theme.spacing.md,
      color: theme.colors.text,
    },
  });
