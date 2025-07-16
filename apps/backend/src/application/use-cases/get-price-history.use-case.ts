import { Injectable } from '@nestjs/common';
import { PriceRecordDto } from '@goldy/shared/types';
import { ErrorUtils } from '@goldy/shared/types';
import { PriceCalculator, IDUtils } from '@goldy/shared/utils';
import { PriceRecordRepository } from '../../infrastructure/database/typeorm/repositories/price-record.repository';
import { PriceRecord } from '../../domain/entities/price-record.entity';
import { AssetListing } from '../../domain/entities/asset-listing.entity';

const { isValidArgument } = ErrorUtils;
const { isValidId } = IDUtils;

@Injectable()
export class GetPriceHistoryUseCase {
  constructor(private readonly priceRecordRepository: PriceRecordRepository) {}

  async getAllPriceRecords(): Promise<PriceRecordDto[]> {
    const records = await this.priceRecordRepository.findAll();
    return records.map(this.mapToDto);
  }

  async getPriceRecordById(id: string): Promise<PriceRecordDto | null> {
    isValidArgument(isValidId(id), 'Invalid price record ID format');

    const record = await this.priceRecordRepository.findById(id);

    return record ? this.mapToDto(record) : null;
  }

  async getPriceHistoryByListingId(
    assetListingId: string
  ): Promise<PriceRecordDto[]> {
    isValidArgument(
      isValidId(assetListingId),
      'Invalid asset listing ID format'
    );

    const records = await this.priceRecordRepository.findByAssetListingId(
      assetListingId
    );

    return records.map(this.mapToDto);
  }

  async getLatestPriceByListingId(
    assetListingId: string
  ): Promise<PriceRecordDto | null> {
    isValidArgument(
      isValidId(assetListingId),
      'Invalid asset listing ID format'
    );

    const record = await this.priceRecordRepository.findLatestByAssetListingId(
      assetListingId
    );

    return record ? this.mapToDto(record) : null;
  }

  async getPricesByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<PriceRecordDto[]> {
    isValidArgument(
      startDate instanceof Date,
      'Start date must be a valid Date'
    );
    isValidArgument(endDate instanceof Date, 'End date must be a valid Date');
    isValidArgument(
      startDate <= endDate,
      'Start date must be before or equal to end date'
    );

    const records = await this.priceRecordRepository.findByDateRange(
      startDate,
      endDate
    );

    return records.map(this.mapToDto);
  }

  async getLatestPrices(): Promise<PriceRecordDto[]> {
    const records = await this.priceRecordRepository.findLatestPrices();
    return records.map(this.mapToDto);
  }

  async createPriceRecord(priceData: {
    assetListingId: string;
    sellPrice?: number;
    buyPrice?: number;
    spotPrice?: number;
    currency?: string;
    deliveryDays?: number;
    inStock?: boolean;
  }): Promise<PriceRecordDto> {
    isValidArgument(
      isValidId(priceData.assetListingId),
      'Invalid asset listing ID format'
    );
    isValidArgument(
      !priceData.sellPrice || priceData.sellPrice > 0,
      'Sell price must be greater than zero'
    );
    isValidArgument(
      !priceData.buyPrice || priceData.buyPrice > 0,
      'Buy price must be greater than zero'
    );
    isValidArgument(
      !priceData.spotPrice || priceData.spotPrice > 0,
      'Spot price must be greater than zero'
    );

    const premiumPercent =
      priceData.sellPrice && priceData.spotPrice
        ? PriceCalculator.calculatePremiumPercent(
            priceData.sellPrice,
            priceData.spotPrice
          )
        : undefined;

    // TODO: This should ideally fetch the full AssetListing entity first
    // For now, we're passing a partial object with just the ID
    const record = await this.priceRecordRepository.create({
      assetListing: { id: priceData.assetListingId } as AssetListing,
      sellPrice: priceData.sellPrice,
      buyPrice: priceData.buyPrice,
      spotPrice: priceData.spotPrice,
      premiumPercent,
      currency: priceData.currency || 'USD',
      deliveryDays: priceData.deliveryDays,
      inStock: priceData.inStock ?? true,
    });

    return this.mapToDto(record);
  }

  async deletePriceRecord(id: string): Promise<boolean> {
    isValidArgument(isValidId(id), 'Invalid price record ID format');

    return this.priceRecordRepository.delete(id);
  }

  private mapToDto(record: PriceRecord): PriceRecordDto {
    return {
      id: record.id,
      assetListingId: record.assetListing.id,
      sellPrice: record.sellPrice,
      buyPrice: record.buyPrice,
      spotPrice: record.spotPrice,
      premiumPercent: record.premiumPercent,
      currency: record.currency,
      deliveryDays: record.deliveryDays,
      inStock: record.inStock,
      scrapedAt: record.scrapedAt,
    };
  }
}
