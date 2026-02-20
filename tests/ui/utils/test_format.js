import { formatValue, formatPercentage, formatPrice, formatNumber } from '../../ui/src/utils/format';

describe('Formatting Functions', () => {
  describe('formatValue', () => {
    test('formats large numbers with T suffix', () => {
      expect(formatValue(1_000_000_000_000)).toBe('1.00T');
      expect(formatValue(2_500_000_000_000)).toBe('2.50T');
    });

    test('formats large numbers with B suffix', () => {
      expect(formatValue(1_000_000_000)).toBe('1.00B');
      expect(formatValue(2_500_000_000)).toBe('2.50B');
    });

    test('formats medium numbers with M suffix', () => {
      expect(formatValue(1_000_000)).toBe('1.00M');
      expect(formatValue(2_500_000)).toBe('2.50M');
    });

    test('formats small numbers with K suffix', () => {
      expect(formatValue(1_000)).toBe('1.00K');
      expect(formatValue(2_500)).toBe('2.50K');
    });

    test('formats regular numbers without suffix', () => {
      expect(formatValue(123.45)).toBe('123.45');
      expect(formatValue(999.99)).toBe('999.99');
    });

    test('handles N/A', () => {
      expect(formatValue(null)).toBe('N/A');
      expect(formatValue(undefined)).toBe('N/A');
      expect(formatValue(NaN)).toBe('N/A');
    });

    test('handles Infinity', () => {
      expect(formatValue(Infinity)).toBe('∞');
    });

    test('trims trailing zeros', () => {
      expect(formatValue(1000)).toBe('1K');
      expect(formatValue(1000.00)).toBe('1K');
      expect(formatValue(1000.50)).toBe('1K');
      expect(formatValue(1000.50).replace('.50', ''))).toBe('1K');
    });
  });

  describe('formatPercentage', () => {
    test('formats percentages with 2 decimal places', () => {
      expect(formatPercentage(12.345)).toBe('12.35%');
      expect(formatPercentage(0.12345)).toBe('12.35%');
    });

    test('handles small percentages', () => {
      expect(formatPercentage(0.005)).toBe('0.50%');
      expect(formatPercentage(0.0001)).toBe('0.01%');
    });

    test('handles <.01%', () => {
      expect(formatPercentage(0.00001)).toBe('<.01%');
    });

    test('handles Infinity', () => {
      expect(formatPercentage(Infinity)).toBe('∞');
    });

    test('handles N/A', () => {
      expect(formatPercentage(null)).toBe('N/A');
      expect(formatPercentage(undefined)).toBe('N/A');
    });

    test('handles negative percentages', () => {
      expect(formatPercentage(-12.345)).toBe('-12.35%');
    });

    test('handles showSign option', () => {
      expect(formatPercentage(12.345, true)).toBe('+12.35%');
      expect(formatPercentage(-12.345, true)).toBe('-12.35%');
    });
  });

  describe('formatPrice', () => {
    test('formats prices with commas and 2 decimal places', () => {
      expect(formatPrice(1234.56)).toBe('$1,234.56');
      expect(formatPrice(1000000)).toBe('$1,000,000.00');
    });

    test('handles N/A', () => {
      expect(formatPrice(null)).toBe('N/A');
      expect(formatPrice(undefined)).toBe('N/A');
    });
  });

  describe('formatNumber', () => {
    test('formats numbers with commas', () => {
      expect(formatNumber(1234)).toBe('1,234');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    test('handles N/A', () => {
      expect(formatNumber(null)).toBe('N/A');
      expect(formatNumber(undefined)).toBe('N/A');
    });
  });
});
