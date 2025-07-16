import { PriceRecord } from '../entities/price-record.entity';

export interface IPriceRecordRepository {
  findAll(): Promise<PriceRecord[]>;
  findById(id: string): Promise<PriceRecord | null>;
  findByAssetListingId(assetListingId: string): Promise<PriceRecord[]>;
  findLatestByAssetListingId(
    assetListingId: string
  ): Promise<PriceRecord | null>;
  findByDateRange(startDate: Date, endDate: Date): Promise<PriceRecord[]>;
  findLatestPrices(): Promise<PriceRecord[]>;
  create(
    priceRecord: Omit<PriceRecord, 'id' | 'scrapedAt'>
  ): Promise<PriceRecord>;
  delete(id: string): Promise<boolean>;
}
