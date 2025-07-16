import { Injectable } from '@nestjs/common';
import { DealerDto, AssetType } from '@goldy/shared/types';
import { DealerRepository } from '../../infrastructure/database/typeorm/repositories/dealer.repository';
import { Dealer } from '../../domain/entities/dealer.entity';

@Injectable()
export class ManageDealersUseCase {
  constructor(private readonly dealerRepository: DealerRepository) {}

  async getAllDealers(): Promise<DealerDto[]> {
    const dealers = await this.dealerRepository.findAll();
    return dealers.map(this.mapToDto);
  }

  async getDealerById(id: string): Promise<DealerDto | null> {
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
    const dealer = await this.dealerRepository.update(id, updates);
    return dealer ? this.mapToDto(dealer) : null;
  }

  async deleteDealer(id: string): Promise<boolean> {
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
