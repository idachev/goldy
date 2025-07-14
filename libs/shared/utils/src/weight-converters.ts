export class WeightConverter {
  static readonly GRAMS_PER_TROY_OUNCE = 31.1034768;
  static readonly GRAMS_PER_KILOGRAM = 1000;
  static readonly GRAMS_PER_POUND = 453.592;

  static gramsToTroyOunces(grams: number): number {
    return grams / this.GRAMS_PER_TROY_OUNCE;
  }

  static troyOuncesToGrams(troyOunces: number): number {
    return troyOunces * this.GRAMS_PER_TROY_OUNCE;
  }

  static gramsToKilograms(grams: number): number {
    return grams / this.GRAMS_PER_KILOGRAM;
  }

  static kilogramsToGrams(kilograms: number): number {
    return kilograms * this.GRAMS_PER_KILOGRAM;
  }

  static gramsToPounds(grams: number): number {
    return grams / this.GRAMS_PER_POUND;
  }

  static poundsToGrams(pounds: number): number {
    return pounds * this.GRAMS_PER_POUND;
  }

  static formatWeight(grams: number, unit: 'g' | 'oz' | 'kg' | 'lb' = 'g'): string {
    switch (unit) {
      case 'oz':
        return `${this.gramsToTroyOunces(grams).toFixed(3)} oz`;
      case 'kg':
        return `${this.gramsToKilograms(grams).toFixed(3)} kg`;
      case 'lb':
        return `${this.gramsToPounds(grams).toFixed(3)} lb`;
      default:
        return `${grams.toFixed(1)} g`;
    }
  }
}