import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { PriceRecordDto } from '@goldy/shared/types';
import { GetPriceHistoryUseCase } from '../../application/use-cases/get-price-history.use-case';

interface PriceHistoryFiltersQuery {
  assetListingId?: string;
  fromDate?: string;
  toDate?: string;
  latest?: boolean;
}

@Controller('api/prices')
export class PricesController {
  constructor(
    private readonly getPriceHistoryUseCase: GetPriceHistoryUseCase
  ) {}

  @Get()
  async getPriceHistory(
    @Query() filters: PriceHistoryFiltersQuery
  ): Promise<PriceRecordDto[]> {
    if (filters.assetListingId && filters.latest === true) {
      const latestPrice =
        await this.getPriceHistoryUseCase.getLatestPriceByListingId(
          filters.assetListingId
        );
      return latestPrice ? [latestPrice] : [];
    }
    if (filters.assetListingId) {
      return this.getPriceHistoryUseCase.getPriceHistoryByListingId(
        filters.assetListingId
      );
    }
    if (filters.latest === true) {
      return this.getPriceHistoryUseCase.getLatestPrices();
    }
    return this.getPriceHistoryUseCase.getAllPriceRecords();
  }

  @Get(':id')
  async getPriceRecordById(@Param('id') id: string): Promise<PriceRecordDto> {
    const priceRecord = await this.getPriceHistoryUseCase.getPriceRecordById(
      id
    );
    if (!priceRecord) {
      throw new NotFoundException(`Price record not found with ID: ${id}`);
    }
    return priceRecord;
  }

  @Get('listing/:assetListingId/latest')
  async getLatestPriceByListingId(
    @Param('assetListingId') assetListingId: string
  ): Promise<PriceRecordDto> {
    const latestPrice =
      await this.getPriceHistoryUseCase.getLatestPriceByListingId(
        assetListingId
      );
    if (!latestPrice) {
      throw new NotFoundException(
        `No price records found for asset listing ID: ${assetListingId}`
      );
    }
    return latestPrice;
  }

  @Get('listing/:assetListingId/history')
  async getPriceHistoryByListingId(
    @Param('assetListingId') assetListingId: string
  ): Promise<PriceRecordDto[]> {
    return this.getPriceHistoryUseCase.getPriceHistoryByListingId(
      assetListingId
    );
  }
}
