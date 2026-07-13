import { formatCentsAsCurrency } from '../../src/utils/currency';

describe('formatCentsAsCurrency', () => {
  it('formats whole-currency-unit amounts from cents', () => {
    const formatted = formatCentsAsCurrency(5000000, 'COP');
    expect(formatted).toContain('50.000');
  });

  it('defaults to COP when no currency is given', () => {
    const formatted = formatCentsAsCurrency(100000);
    expect(formatted).toContain('1.000');
  });
});
