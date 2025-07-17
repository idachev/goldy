import { PriceCalculator } from './price-calculators';

describe('PriceCalculator', () => {
  describe('calculatePremiumPercent', () => {
    it('should calculate premium percentage correctly', () => {
      expect(PriceCalculator.calculatePremiumPercent(110, 100)).toBe(10);
      expect(PriceCalculator.calculatePremiumPercent(120, 100)).toBe(20);
      expect(PriceCalculator.calculatePremiumPercent(95, 100)).toBe(-5);
    });

    it('should return 0 when spot price is 0', () => {
      expect(PriceCalculator.calculatePremiumPercent(100, 0)).toBe(0);
    });

    it('should handle same prices (0% premium)', () => {
      expect(PriceCalculator.calculatePremiumPercent(100, 100)).toBe(0);
    });

    it('should handle decimal values', () => {
      expect(PriceCalculator.calculatePremiumPercent(105.5, 100)).toBe(5.5);
      expect(PriceCalculator.calculatePremiumPercent(99.25, 100)).toBe(-0.75);
    });
  });

  describe('calculatePricePerGram', () => {
    it('should calculate price per gram correctly', () => {
      expect(PriceCalculator.calculatePricePerGram(100, 10)).toBe(10);
      expect(PriceCalculator.calculatePricePerGram(150, 25)).toBe(6);
      expect(PriceCalculator.calculatePricePerGram(31.1, 31.1)).toBe(1);
    });

    it('should return 0 when weight is 0', () => {
      expect(PriceCalculator.calculatePricePerGram(100, 0)).toBe(0);
    });

    it('should handle decimal values', () => {
      expect(PriceCalculator.calculatePricePerGram(123.45, 5.5)).toBeCloseTo(
        22.445,
        3
      );
    });
  });

  describe('calculatePricePerTroyOunce', () => {
    it('should calculate price per troy ounce correctly', () => {
      const gramsPerOz = 31.1034768;
      expect(
        PriceCalculator.calculatePricePerTroyOunce(31.1034768, gramsPerOz)
      ).toBeCloseTo(31.1034768, 6);
      expect(
        PriceCalculator.calculatePricePerTroyOunce(62.2069536, gramsPerOz)
      ).toBeCloseTo(62.2069536, 6);
    });

    it('should return 0 when weight is 0', () => {
      expect(PriceCalculator.calculatePricePerTroyOunce(100, 0)).toBe(0);
    });

    it('should handle various weight values', () => {
      expect(
        PriceCalculator.calculatePricePerTroyOunce(100, 15.55)
      ).toBeCloseTo(200, 0);
    });
  });

  describe('calculateSpotValueForWeight', () => {
    it('should calculate spot value for weight correctly', () => {
      const gramsPerOz = 31.1034768;
      expect(
        PriceCalculator.calculateSpotValueForWeight(100, gramsPerOz)
      ).toBeCloseTo(100, 6);
      expect(
        PriceCalculator.calculateSpotValueForWeight(200, gramsPerOz * 2)
      ).toBeCloseTo(400, 6);
    });

    it('should handle fractional troy ounces', () => {
      const halfOzInGrams = 31.1034768 / 2;
      expect(
        PriceCalculator.calculateSpotValueForWeight(100, halfOzInGrams)
      ).toBeCloseTo(50, 6);
    });

    it('should handle zero values', () => {
      expect(PriceCalculator.calculateSpotValueForWeight(0, 31.1034768)).toBe(
        0
      );
      expect(PriceCalculator.calculateSpotValueForWeight(100, 0)).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    it('should format USD currency by default', () => {
      expect(PriceCalculator.formatCurrency(100)).toBe('$100.00');
      expect(PriceCalculator.formatCurrency(1234.56)).toBe('$1,234.56');
      expect(PriceCalculator.formatCurrency(0)).toBe('$0.00');
    });

    it('should format specified currency', () => {
      expect(PriceCalculator.formatCurrency(100, 'EUR')).toBe('€100.00');
      expect(PriceCalculator.formatCurrency(100, 'GBP')).toBe('£100.00');
    });

    it('should handle decimal places correctly', () => {
      expect(PriceCalculator.formatCurrency(123.456)).toBe('$123.46');
      expect(PriceCalculator.formatCurrency(123.454)).toBe('$123.45');
    });

    it('should handle negative amounts', () => {
      expect(PriceCalculator.formatCurrency(-100)).toBe('-$100.00');
    });

    it('should handle large amounts with commas', () => {
      expect(PriceCalculator.formatCurrency(1234567.89)).toBe('$1,234,567.89');
    });
  });

  describe('formatPercentage', () => {
    it('should format positive percentages with plus sign', () => {
      expect(PriceCalculator.formatPercentage(5.5)).toBe('+5.50%');
      expect(PriceCalculator.formatPercentage(10)).toBe('+10.00%');
      expect(PriceCalculator.formatPercentage(0.123)).toBe('+0.12%');
    });

    it('should format negative percentages with minus sign', () => {
      expect(PriceCalculator.formatPercentage(-5.5)).toBe('-5.50%');
      expect(PriceCalculator.formatPercentage(-10)).toBe('-10.00%');
      expect(PriceCalculator.formatPercentage(-0.123)).toBe('-0.12%');
    });

    it('should format zero percentage with plus sign', () => {
      expect(PriceCalculator.formatPercentage(0)).toBe('+0.00%');
    });

    it('should round to 2 decimal places', () => {
      expect(PriceCalculator.formatPercentage(5.554)).toBe('+5.55%');
      expect(PriceCalculator.formatPercentage(5.555)).toBe('+5.55%');
      expect(PriceCalculator.formatPercentage(5.556)).toBe('+5.56%');
      expect(PriceCalculator.formatPercentage(-5.555)).toBe('-5.55%');
    });
  });
});
