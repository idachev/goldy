import { Injectable } from '@nestjs/common';
import { PriceRecordDto } from '@goldy/shared/types';
import { PriceCalculator } from '@goldy/shared/utils';
import { PriceRecordRepository } from '../../infrastructure/database/typeorm/repositories/price-record.repository';
import { PriceRecord } from '../../domain/entities/price-record.entity';

@Injectable()
export class GetPriceHistoryUseCase {
  constructor(private readonly priceRecordRepository: PriceRecordRepository) {}

  async getAllPriceRecords(): Promise<PriceRecordDto[]> {
    const records = await this.priceRecordRepository.findAll();
    return records.map(this.mapToDto);
  }

  async getPriceRecordById(id: string): Promise<PriceRecordDto | null> {
    const record = await this.priceRecordRepository.findById(id);
    return record ? this.mapToDto(record) : null;
  }

  async getPriceHistoryByListingId(assetListingId: string): Promise<PriceRecordDto[]> {
    const records = await this.priceRecordRepository.findByAssetListingId(assetListingId);
    return records.map(this.mapToDto);
  }

  async getLatestPriceByListingId(assetListingId: string): Promise<PriceRecordDto | null> {
    const record = await this.priceRecordRepository.findLatestByAssetListingId(assetListingId);
    return record ? this.mapToDto(record) : null;
  }

  async getPricesByDateRange(startDate: Date, endDate: Date): Promise<PriceRecordDto[]> {
    const records = await this.priceRecordRepository.findByDateRange(startDate, endDate);
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
    const premiumPercent = priceData.sellPrice && priceData.spotPrice
      ? PriceCalculator.calculatePremiumPercent(priceData.sellPrice, priceData.spotPrice)
      : undefined;

    const record = await this.priceRecordRepository.create({
      assetListing: { id: priceData.assetListingId } as any,
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