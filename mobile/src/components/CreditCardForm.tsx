import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { CardBrandBadge } from './CardBrandBadge';
import { Button } from './Button';
import { Theme, useTheme } from '../theme';
import {
  CardFormValues,
  detectCardBrand,
  isCardFormValid,
  isValidEmail,
  validateCardForm,
} from '../utils/cardValidation';

export interface CreditCardFormSubmitValues extends CardFormValues {
  customerEmail: string;
}

export interface CreditCardFormProps {
  onSubmit: (values: CreditCardFormSubmitValues) => void;
  /** Fires on every keystroke — lets a parent drive a live CreditCardVisual preview. */
  onValuesChange?: (values: CardFormValues) => void;
}

export function CreditCardForm({ onSubmit, onValuesChange }: Readonly<CreditCardFormProps>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [number, setNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [touched, setTouched] = useState(false);

  const formatCardNumber = (text: string): string => {
    const digits = text.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleNumberChange = (text: string): void => {
    setNumber(formatCardNumber(text));
  };

  const brand = useMemo(() => detectCardBrand(number), [number]);
  const cardValues: CardFormValues = { number, cardHolder, expiryMonth, expiryYear, cvc };
  const errors = validateCardForm(cardValues);
  const emailValid = isValidEmail(customerEmail);
  const formValid = isCardFormValid(errors) && emailValid;

  useEffect(() => {
    onValuesChange?.(cardValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [number, cardHolder, expiryMonth, expiryYear, cvc]);

  const handleSubmit = (): void => {
    setTouched(true);
    if (!formValid) {
      return;
    }
    onSubmit({ ...cardValues, customerEmail });
  };

  const holderEmpty = touched && cardHolder.trim().length === 0;
  const monthEmpty = touched && expiryMonth.trim().length === 0;
  const yearEmpty = touched && expiryYear.trim().length === 0;
  const cvcEmpty = touched && cvc.trim().length === 0;
  const emailEmpty = touched && customerEmail.trim().length === 0;

  const inputStyle = (hasError: boolean) => [
    styles.input,
    hasError ? styles.inputError : null,
  ];

  return (
    <View testID="credit-card-form">
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Numero de tarjeta</Text>
        <View style={styles.cardNumberRow}>
          <TextInput
            style={[styles.input, touched && errors.number ? styles.inputError : null, styles.grow]}
            placeholder="0000 0000 0000 0000"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="number-pad"
            value={number}
            onChangeText={handleNumberChange}
            testID="input-card-number"
            maxLength={19}
          />
          <CardBrandBadge brand={brand} />
        </View>
        {touched && errors.number && <Text style={styles.error}>{errors.number}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nombre del titular</Text>
        <TextInput
          style={inputStyle(touched && (!!errors.cardHolder || holderEmpty))}
          placeholder="Como aparece en la tarjeta"
          placeholderTextColor={theme.colors.textSecondary}
          value={cardHolder}
          onChangeText={setCardHolder}
          testID="input-card-holder"
        />
        {touched && errors.cardHolder && <Text style={styles.error}>{errors.cardHolder}</Text>}
      </View>

      <View style={styles.row}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Fecha de vencimiento</Text>
          <View style={styles.expiryRow}>
            <TextInput
              style={inputStyle(touched && (!!errors.expiry || monthEmpty))}
              placeholder="MM"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="number-pad"
              maxLength={2}
              value={expiryMonth}
              onChangeText={setExpiryMonth}
              testID="input-expiry-month"
            />
            <Text style={styles.expirySeparator}>/</Text>
            <TextInput
              style={inputStyle(touched && (!!errors.expiry || yearEmpty))}
              placeholder="AA"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="number-pad"
              maxLength={2}
              value={expiryYear}
              onChangeText={setExpiryYear}
              testID="input-expiry-year"
            />
          </View>
          {touched && errors.expiry && <Text style={styles.error}>{errors.expiry}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>CVC</Text>
          <TextInput
            style={inputStyle(touched && (!!errors.cvc || cvcEmpty))}
            placeholder="123"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            value={cvc}
            onChangeText={setCvc}
            testID="input-cvc"
          />
          {touched && errors.cvc && <Text style={styles.error}>{errors.cvc}</Text>}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Correo electronico</Text>
        <TextInput
          style={inputStyle(touched && (!emailValid || emailEmpty))}
          placeholder="tu@correo.com"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          value={customerEmail}
          onChangeText={setCustomerEmail}
          testID="input-email"
        />
        {touched && emailEmpty && <Text style={styles.error}>El correo electronico es obligatorio</Text>}
        {touched && !emailEmpty && !emailValid && <Text style={styles.error}>Ingrese un correo electronico valido</Text>}
      </View>

      <Button label="Continuar" onPress={handleSubmit} testID="continue-button" style={styles.submitButton} />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    inputGroup: {
      marginBottom: theme.spacing.md,
    },
    inputLabel: {
      fontSize: theme.typography.sizes.caption,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      color: theme.colors.text,
      borderRadius: theme.radii.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 2,
      fontSize: theme.typography.sizes.body,
    },
    inputError: {
      borderWidth: 1,
      borderColor: theme.colors.danger,
    },
    grow: { flex: 1 },
    small: { flex: 1 },
    cardNumberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    row: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    expiryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    expirySeparator: {
      fontSize: theme.typography.sizes.h3,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.weights.medium,
    },
    error: {
      color: theme.colors.danger,
      fontSize: theme.typography.sizes.caption,
      marginTop: theme.spacing.xs,
    },
    submitButton: { marginTop: theme.spacing.lg },
  });
