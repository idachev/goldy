export interface PriceRecordDto {
  id: string;
  assetListingId: string;
  sellPrice?: number;
  buyPrice?: number;
  spotPrice?: number;
  premiumPercent?: number;
  currency?: string;
  deliveryDays?: number;
  inStock: boolean;
  scrapedAt: Date;
}
