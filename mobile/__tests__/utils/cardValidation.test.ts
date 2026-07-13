import {
  detectCardBrand,
  isCardFormValid,
  isValidCardHolder,
  isValidCardNumber,
  isValidCvc,
  isValidExpiry,
  validateCardForm,
} from '../../src/utils/cardValidation';

describe('isValidCardNumber', () => {
  it('accepts a valid VISA test number', () => {
    expect(isValidCardNumber('4242424242424242')).toBe(true);
  });

  it('accepts a number with spaces', () => {
    expect(isValidCardNumber('4242 4242 4242 4242')).toBe(true);
  });

  it('rejects a number that fails the Luhn checksum', () => {
    expect(isValidCardNumber('4242424242424241')).toBe(false);
  });

  it('rejects non-numeric input', () => {
    expect(isValidCardNumber('abcd efgh ijkl mnop')).toBe(false);
  });

  it('rejects a number that is too short', () => {
    expect(isValidCardNumber('42424242')).toBe(false);
  });
});

describe('detectCardBrand', () => {
  it('detects VISA for numbers starting with 4', () => {
    expect(detectCardBrand('4242424242424242')).toBe('VISA');
  });

  it('detects MASTERCARD for numbers starting with 51-55', () => {
    expect(detectCardBrand('5254133674131644')).toBe('MASTERCARD');
  });

  it('detects MASTERCARD for the newer 2221-2720 BIN range', () => {
    expect(detectCardBrand('2223000048400011')).toBe('MASTERCARD');
  });

  it('returns UNKNOWN for unrecognized prefixes', () => {
    expect(detectCardBrand('6011000000000004')).toBe('UNKNOWN');
  });
});

describe('isValidExpiry', () => {
  it('accepts a future date', () => {
    expect(isValidExpiry('12', '99')).toBe(true);
  });

  it('rejects an invalid month', () => {
    expect(isValidExpiry('13', '99')).toBe(false);
    expect(isValidExpiry('00', '99')).toBe(false);
  });

  it('rejects a past year', () => {
    expect(isValidExpiry('01', '00')).toBe(false);
  });

  it('rejects malformed input', () => {
    expect(isValidExpiry('1', '9')).toBe(false);
  });
});

describe('isValidCvc', () => {
  it('accepts 3 and 4 digit codes', () => {
    expect(isValidCvc('123')).toBe(true);
    expect(isValidCvc('1234')).toBe(true);
  });

  it('rejects non-numeric or wrong-length codes', () => {
    expect(isValidCvc('12')).toBe(false);
    expect(isValidCvc('12a')).toBe(false);
  });
});

describe('isValidCardHolder', () => {
  it('accepts a plausible name', () => {
    expect(isValidCardHolder('John Doe')).toBe(true);
  });

  it('rejects an empty or too-short name', () => {
    expect(isValidCardHolder('  ')).toBe(false);
    expect(isValidCardHolder('Al')).toBe(false);
  });
});

describe('validateCardForm / isCardFormValid', () => {
  it('returns no errors for a fully valid form', () => {
    const errors = validateCardForm({
      number: '4242424242424242',
      cardHolder: 'John Doe',
      expiryMonth: '12',
      expiryYear: '99',
      cvc: '123',
    });

    expect(isCardFormValid(errors)).toBe(true);
  });

  it('collects an error per invalid field', () => {
    const errors = validateCardForm({
      number: '0000',
      cardHolder: '',
      expiryMonth: '13',
      expiryYear: '00',
      cvc: '1',
    });

    expect(errors.number).toBeDefined();
    expect(errors.cardHolder).toBeDefined();
    expect(errors.expiry).toBeDefined();
    expect(errors.cvc).toBeDefined();
    expect(isCardFormValid(errors)).toBe(false);
  });
});
