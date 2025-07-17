import { WeightConverter } from './weight-converters';

describe('WeightConverter', () => {
  describe('constants', () => {
    it('should have correct conversion constants', () => {
      expect(WeightConverter.GRAMS_PER_TROY_OUNCE).toBe(31.1034768);
      expect(WeightConverter.GRAMS_PER_KILOGRAM).toBe(1000);
      expect(WeightConverter.GRAMS_PER_POUND).toBe(453.592);
    });
  });

  describe('gramsToTroyOunces', () => {
    it('should convert grams to troy ounces correctly', () => {
      expect(WeightConverter.gramsToTroyOunces(31.1034768)).toBeCloseTo(1, 6);
      expect(WeightConverter.gramsToTroyOunces(62.2069536)).toBeCloseTo(2, 6);
      expect(WeightConverter.gramsToTroyOunces(0)).toBe(0);
    });

    it('should handle decimal values', () => {
      expect(WeightConverter.gramsToTroyOunces(15.55)).toBeCloseTo(0.5, 1);
    });

    it('should handle large values', () => {
      expect(WeightConverter.gramsToTroyOunces(1000)).toBeCloseTo(32.15, 2);
    });
  });

  describe('troyOuncesToGrams', () => {
    it('should convert troy ounces to grams correctly', () => {
      expect(WeightConverter.troyOuncesToGrams(1)).toBeCloseTo(31.1034768, 6);
      expect(WeightConverter.troyOuncesToGrams(2)).toBeCloseTo(62.2069536, 6);
      expect(WeightConverter.troyOuncesToGrams(0)).toBe(0);
    });

    it('should handle decimal values', () => {
      expect(WeightConverter.troyOuncesToGrams(0.5)).toBeCloseTo(15.5517384, 6);
    });

    it('should be inverse of gramsToTroyOunces', () => {
      const grams = 123.45;
      const ounces = WeightConverter.gramsToTroyOunces(grams);
      const backToGrams = WeightConverter.troyOuncesToGrams(ounces);
      expect(backToGrams).toBeCloseTo(grams, 10);
    });
  });

  describe('gramsToKilograms', () => {
    it('should convert grams to kilograms correctly', () => {
      expect(WeightConverter.gramsToKilograms(1000)).toBe(1);
      expect(WeightConverter.gramsToKilograms(2000)).toBe(2);
      expect(WeightConverter.gramsToKilograms(500)).toBe(0.5);
      expect(WeightConverter.gramsToKilograms(0)).toBe(0);
    });

    it('should handle decimal values', () => {
      expect(WeightConverter.gramsToKilograms(1234.5)).toBe(1.2345);
    });
  });

  describe('kilogramsToGrams', () => {
    it('should convert kilograms to grams correctly', () => {
      expect(WeightConverter.kilogramsToGrams(1)).toBe(1000);
      expect(WeightConverter.kilogramsToGrams(2)).toBe(2000);
      expect(WeightConverter.kilogramsToGrams(0.5)).toBe(500);
      expect(WeightConverter.kilogramsToGrams(0)).toBe(0);
    });

    it('should handle decimal values', () => {
      expect(WeightConverter.kilogramsToGrams(1.2345)).toBe(1234.5);
    });

    it('should be inverse of gramsToKilograms', () => {
      const grams = 1234.56;
      const kg = WeightConverter.gramsToKilograms(grams);
      const backToGrams = WeightConverter.kilogramsToGrams(kg);
      expect(backToGrams).toBeCloseTo(grams, 10);
    });
  });

  describe('gramsToPounds', () => {
    it('should convert grams to pounds correctly', () => {
      expect(WeightConverter.gramsToPounds(453.592)).toBeCloseTo(1, 6);
      expect(WeightConverter.gramsToPounds(907.184)).toBeCloseTo(2, 6);
      expect(WeightConverter.gramsToPounds(0)).toBe(0);
    });

    it('should handle decimal values', () => {
      expect(WeightConverter.gramsToPounds(226.796)).toBeCloseTo(0.5, 6);
    });
  });

  describe('poundsToGrams', () => {
    it('should convert pounds to grams correctly', () => {
      expect(WeightConverter.poundsToGrams(1)).toBeCloseTo(453.592, 6);
      expect(WeightConverter.poundsToGrams(2)).toBeCloseTo(907.184, 6);
      expect(WeightConverter.poundsToGrams(0)).toBe(0);
    });

    it('should handle decimal values', () => {
      expect(WeightConverter.poundsToGrams(0.5)).toBeCloseTo(226.796, 6);
    });

    it('should be inverse of gramsToPounds', () => {
      const grams = 1000;
      const pounds = WeightConverter.gramsToPounds(grams);
      const backToGrams = WeightConverter.poundsToGrams(pounds);
      expect(backToGrams).toBeCloseTo(grams, 10);
    });
  });

  describe('formatWeight', () => {
    describe('default unit (grams)', () => {
      it('should format grams with 1 decimal place', () => {
        expect(WeightConverter.formatWeight(100)).toBe('100.0 g');
        expect(WeightConverter.formatWeight(123.456)).toBe('123.5 g');
        expect(WeightConverter.formatWeight(0)).toBe('0.0 g');
      });

      it('should explicitly format as grams', () => {
        expect(WeightConverter.formatWeight(100, 'g')).toBe('100.0 g');
      });
    });

    describe('troy ounces', () => {
      it('should format troy ounces with 3 decimal places', () => {
        expect(WeightConverter.formatWeight(31.1034768, 'oz')).toBe('1.000 oz');
        expect(WeightConverter.formatWeight(62.2069536, 'oz')).toBe('2.000 oz');
        expect(WeightConverter.formatWeight(15.55, 'oz')).toBe('0.500 oz');
      });

      it('should handle zero weight', () => {
        expect(WeightConverter.formatWeight(0, 'oz')).toBe('0.000 oz');
      });
    });

    describe('kilograms', () => {
      it('should format kilograms with 3 decimal places', () => {
        expect(WeightConverter.formatWeight(1000, 'kg')).toBe('1.000 kg');
        expect(WeightConverter.formatWeight(2500, 'kg')).toBe('2.500 kg');
        expect(WeightConverter.formatWeight(0, 'kg')).toBe('0.000 kg');
      });
    });

    describe('pounds', () => {
      it('should format pounds with 3 decimal places', () => {
        expect(WeightConverter.formatWeight(453.592, 'lb')).toBe('1.000 lb');
        expect(WeightConverter.formatWeight(907.184, 'lb')).toBe('2.000 lb');
        expect(WeightConverter.formatWeight(0, 'lb')).toBe('0.000 lb');
      });
    });

    describe('rounding behavior', () => {
      it('should round correctly for different units', () => {
        expect(WeightConverter.formatWeight(123.456, 'g')).toBe('123.5 g');
        expect(WeightConverter.formatWeight(123.456, 'oz')).toBe('3.969 oz');
        expect(WeightConverter.formatWeight(123.456, 'kg')).toBe('0.123 kg');
        expect(WeightConverter.formatWeight(123.456, 'lb')).toBe('0.272 lb');
      });
    });
  });
});
