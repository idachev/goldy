import { AssetListing } from '../../../domain/entities/asset-listing.entity';

export interface ScrapedPriceData {
  sellPrice?: number;
  buyPrice?: number;
  spotPrice?: number;
  currency?: string;
  deliveryDays?: number;
  inStock: boolean;
}

export interface IScraperStrategy {
  canHandle(dealerName: string): boolean;
  scrapePrice(assetListing: AssetListing): Promise<ScrapedPriceData | null>;
}
