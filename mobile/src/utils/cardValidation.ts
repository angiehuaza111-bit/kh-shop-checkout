export type CardBrand = 'VISA' | 'MASTERCARD' | 'UNKNOWN';

/** Standard Luhn checksum, used by every major card network. */
export function isValidCardNumber(rawNumber: string): boolean {
  const digits = rawNumber.replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(digits)) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function detectCardBrand(rawNumber: string): CardBrand {
  const digits = rawNumber.replace(/\s+/g, '');
  if (/^4\d*/.test(digits)) {
    return 'VISA';
  }
  if (/^(5[1-5]\d*|2(2[2-9]\d*|[3-6]\d*|7[01]\d*|720))/.test(digits)) {
    return 'MASTERCARD';
  }
  return 'UNKNOWN';
}

export function isValidExpiry(month: string, year: string): boolean {
  if (!/^\d{2}$/.test(month) || !/^\d{2}$/.test(year)) {
    return false;
  }
  const monthNum = Number(month);
  if (monthNum < 1 || monthNum > 12) {
    return false;
  }

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  const yearNum = Number(year);

  if (yearNum < currentYear) {
    return false;
  }
  if (yearNum === currentYear && monthNum < currentMonth) {
    return false;
  }
  return true;
}

export function isValidCvc(cvc: string): boolean {
  return /^\d{3,4}$/.test(cvc);
}

export function isValidCardHolder(name: string): boolean {
  return name.trim().length >= 5;
}

export function isValidEmail(email: string): boolean {
  const at = email.indexOf('@');
  if (at < 1) return false;
  const dot = email.lastIndexOf('.');
  return dot > at + 1 && dot < email.length - 1;
}

export interface CardFormValues {
  number: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
}

export interface CardFormErrors {
  number?: string;
  cardHolder?: string;
  expiry?: string;
  cvc?: string;
}

export function validateCardForm(values: CardFormValues): CardFormErrors {
  const errors: CardFormErrors = {};

  if (!isValidCardNumber(values.number)) {
    errors.number = 'Ingrese un número de tarjeta válido';
  }
  if (!isValidCardHolder(values.cardHolder)) {
    errors.cardHolder = 'El nombre debe tener más de 5 caracteres';
  }
  if (!isValidExpiry(values.expiryMonth, values.expiryYear)) {
    errors.expiry = 'Ingrese una fecha válida y no vencida (MM/AA)';
  }
  if (!isValidCvc(values.cvc)) {
    errors.cvc = 'Ingrese un CVC válido';
  }

  return errors;
}

export function isCardFormValid(errors: CardFormErrors): boolean {
  return Object.keys(errors).length === 0;
}
