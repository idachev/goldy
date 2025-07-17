import { Injectable } from '@nestjs/common';
import { DealerDto, AssetType } from '@goldy/shared/types';
import { ErrorUtils, IDUtils } from '@goldy/shared/utils';
import { DealerRepository } from '../../infrastructure/database/typeorm/repositories/dealer.repository';
import { Dealer } from '../../domain/entities/dealer.entity';

const { isValidArgument } = ErrorUtils;
const { isValidId } = IDUtils;

@Injectable()
export class ManageDealersUseCase {
  constructor(private readonly dealerRepository: DealerRepository) {}

  async getAllDealers(): Promise<DealerDto[]> {
    const dealers = await this.dealerRepository.findAll();
    return dealers.map(this.mapToDto);
  }

  async getDealerById(id: string): Promise<DealerDto | null> {
    isValidArgument(isValidId(id), 'Invalid dealer ID format');

    const dealer = await this.dealerRepository.findById(id);

    return dealer ? this.mapToDto(dealer) : null;
  }

  async getActiveDealers(): Promise<DealerDto[]> {
    const dealers = await this.dealerRepository.findActive();
    return dealers.map(this.mapToDto);
  }

  async createDealer(dealerData: {
    name: string;
    websiteUrl: string;
    scrapingConfig: {
      selectors: Record<string, string>;
      urlPatterns: Record<AssetType, string>;
    };
    isActive?: boolean;
  }): Promise<DealerDto> {
    isValidArgument(!!dealerData.name?.trim(), 'Dealer name is required');
    isValidArgument(!!dealerData.websiteUrl?.trim(), 'Website URL is required');
    isValidArgument(
      !!dealerData.scrapingConfig,
      'Scraping configuration is required'
    );
    isValidArgument(
      !!dealerData.scrapingConfig?.selectors,
      'Scraping selectors are required'
    );
    isValidArgument(
      !!dealerData.scrapingConfig?.urlPatterns,
      'URL patterns are required'
    );

    const dealer = await this.dealerRepository.create({
      ...dealerData,
      isActive: dealerData.isActive ?? true,
    });

    return this.mapToDto(dealer);
  }

  async updateDealer(
    id: string,
    updates: Partial<{
      name: string;
      websiteUrl: string;
      scrapingConfig: {
        selectors: Record<string, string>;
        urlPatterns: Record<AssetType, string>;
      };
      isActive: boolean;
    }>
  ): Promise<DealerDto | null> {
    isValidArgument(isValidId(id), 'Invalid dealer ID format');

    const dealer = await this.dealerRepository.update(id, updates);

    return dealer ? this.mapToDto(dealer) : null;
  }

  async deleteDealer(id: string): Promise<boolean> {
    isValidArgument(isValidId(id), 'Invalid dealer ID format');

    return this.dealerRepository.delete(id);
  }

  private mapToDto(dealer: Dealer): DealerDto {
    return {
      id: dealer.id,
      name: dealer.name,
      websiteUrl: dealer.websiteUrl,
      scrapingConfig: dealer.scrapingConfig,
      isActive: dealer.isActive,
      createdAt: dealer.createdAt,
    };
  }
}
