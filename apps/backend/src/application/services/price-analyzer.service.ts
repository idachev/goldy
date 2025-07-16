import { Injectable } from '@nestjs/common';
import { PriceCalculator } from '@goldy/shared/utils';
import { PriceRecordRepository } from '../../infrastructure/database/typeorm/repositories/price-record.repository';

export interface PriceComparison {
  assetListingId: string;
  assetName: string;
  dealerName: string;
  sellPrice?: number;
  buyPrice?: number;
  spotPrice?: number;
  premiumPercent?: number;
  pricePerGram?: number;
  pricePerTroyOunce?: number;
  currency?: string;
  inStock: boolean;
  lastUpdated: Date;
}

export interface PriceTrend {
  assetListingId: string;
  currentPrice?: number;
  previousPrice?: number;
  priceChange?: number;
  priceChangePercent?: number;
  trend: 'up' | 'down' | 'stable';
}

@Injectable()
export class PriceAnalyzerService {
  constructor(private readonly priceRecordRepository: PriceRecordRepository) {}

  async comparePricesAcrossDealers(
    assetId?: string
  ): Promise<PriceComparison[]> {
    const latestPrices = await this.priceRecordRepository.findLatestPrices();

    return latestPrices
      .filter((record) => !assetId || record.assetListing.asset.id === assetId)
      .map((record) => {
        const asset = record.assetListing.asset;
        const dealer = record.assetListing.dealer;

        return {
          assetListingId: record.assetListing.id,
          assetName: asset.name,
          dealerName: dealer.name,
          sellPrice: record.sellPrice,
          buyPrice: record.buyPrice,
          spotPrice: record.spotPrice,
          premiumPercent: record.premiumPercent,
          pricePerGram: record.sellPrice
            ? PriceCalculator.calculatePricePerGram(
                record.sellPrice,
                asset.weightGrams
              )
            : undefined,
          pricePerTroyOunce: record.sellPrice
            ? PriceCalculator.calculatePricePerTroyOunce(
                record.sellPrice,
                asset.weightGrams
              )
            : undefined,
          currency: record.currency,
          inStock: record.inStock,
          lastUpdated: record.scrapedAt,
        };
      })
      .sort((a, b) => (a.sellPrice || 0) - (b.sellPrice || 0));
  }

  async analyzePriceTrends(days: number = 7): Promise<PriceTrend[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const recentPrices = await this.priceRecordRepository.findByDateRange(
      startDate,
      endDate
    );
    const latestPrices = await this.priceRecordRepository.findLatestPrices();

    const trends: Map<string, PriceTrend> = new Map();

    latestPrices.forEach((latestRecord) => {
      const listingId = latestRecord.assetListing.id;
      const oldestRecord = recentPrices
        .filter((r) => r.assetListing.id === listingId)
        .sort((a, b) => a.scrapedAt.getTime() - b.scrapedAt.getTime())[0];

      const currentPrice = latestRecord.sellPrice;
      const previousPrice = oldestRecord?.sellPrice;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      let priceChange: number | undefined;
      let priceChangePercent: number | undefined;

      if (currentPrice && previousPrice) {
        priceChange = currentPrice - previousPrice;
        priceChangePercent = (priceChange / previousPrice) * 100;

        if (Math.abs(priceChangePercent) > 0.5) {
          // 0.5% threshold
          trend = priceChange > 0 ? 'up' : 'down';
        }
      }

      trends.set(listingId, {
        assetListingId: listingId,
        currentPrice,
        previousPrice,
        priceChange,
        priceChangePercent,
        trend,
      });
    });

    return Array.from(trends.values());
  }

  async findBestDeals(
    metalType?: string,
    limit: number = 10
  ): Promise<PriceComparison[]> {
    const comparisons = await this.comparePricesAcrossDealers();

    // TODO: Implement metalType filtering when asset metadata is available
    // .filter((comp) => {
    //   if (!metalType) return true;
    //   // This would need asset metadata to filter by metal type
    //   return comp.metalType === metalType;
    // })

    return comparisons
      .filter((comp) => comp.inStock && comp.premiumPercent !== undefined)
      .sort((a, b) => (a.premiumPercent || 0) - (b.premiumPercent || 0))
      .slice(0, limit);
  }

  calculatePortfolioValue(
    _holdings: Array<{
      assetListingId: string;
      quantity: number;
    }>
  ): Promise<{
    totalValue: number;
    breakdown: Array<{
      assetListingId: string;
      quantity: number;
      unitPrice?: number;
      totalValue: number;
    }>;
  }> {
    // Implementation for portfolio value calculation
    // This would require holdings data structure
    throw new Error('Portfolio calculation not implemented yet');
  }
}
