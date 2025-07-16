export class PriceCalculator {
  static calculatePremiumPercent(
    assetPrice: number,
    spotPrice: number
  ): number {
    if (spotPrice === 0) return 0;
    return ((assetPrice - spotPrice) / spotPrice) * 100;
  }

  static calculatePricePerGram(
    totalPrice: number,
    weightGrams: number
  ): number {
    if (weightGrams === 0) return 0;
    return totalPrice / weightGrams;
  }

  static calculatePricePerTroyOunce(
    totalPrice: number,
    weightGrams: number
  ): number {
    if (weightGrams === 0) return 0;
    const troyOunces = weightGrams / 31.1034768;
    return totalPrice / troyOunces;
  }

  static calculateSpotValueForWeight(
    spotPricePerOz: number,
    weightGrams: number
  ): number {
    const troyOunces = weightGrams / 31.1034768;
    return spotPricePerOz * troyOunces;
  }

  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  static formatPercentage(percentage: number): string {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  }
}
