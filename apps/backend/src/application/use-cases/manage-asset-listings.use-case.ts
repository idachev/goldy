import { Injectable } from '@nestjs/common';
import { AssetListingDto } from '@goldy/shared/types';
import { ErrorUtils, IDUtils } from '@goldy/shared/utils';
import { AssetListingRepository } from '../../infrastructure/database/typeorm/repositories/asset-listing.repository';
import { AssetRepository } from '../../infrastructure/database/typeorm/repositories/asset.repository';
import { DealerRepository } from '../../infrastructure/database/typeorm/repositories/dealer.repository';
import { AssetListing } from '../../domain/entities/asset-listing.entity';

const { isValidArgument, isFoundResource } = ErrorUtils;
const { isValidId } = IDUtils;

@Injectable()
export class ManageAssetListingsUseCase {
  constructor(
    private readonly assetListingRepository: AssetListingRepository,
    private readonly assetRepository: AssetRepository,
    private readonly dealerRepository: DealerRepository
  ) {}

  async getAllListings(): Promise<AssetListingDto[]> {
    const listings = await this.assetListingRepository.findAll();
    return listings.map(this.mapToDto);
  }

  async getListingById(id: string): Promise<AssetListingDto | null> {
    isValidArgument(isValidId(id), 'Invalid listing ID format');

    const listing = await this.assetListingRepository.findById(id);

    return listing ? this.mapToDto(listing) : null;
  }

  async getListingsByAssetId(assetId: string): Promise<AssetListingDto[]> {
    isValidArgument(isValidId(assetId), 'Invalid asset ID format');

    const listings = await this.assetListingRepository.findByAssetId(assetId);

    return listings.map(this.mapToDto);
  }

  async getListingsByDealerId(dealerId: string): Promise<AssetListingDto[]> {
    isValidArgument(isValidId(dealerId), 'Invalid dealer ID format');

    const listings = await this.assetListingRepository.findByDealerId(dealerId);

    return listings.map(this.mapToDto);
  }

  async getActiveListings(): Promise<AssetListingDto[]> {
    const listings = await this.assetListingRepository.findActive();
    return listings.map(this.mapToDto);
  }

  async createListing(listingData: {
    assetId: string;
    dealerId: string;
    productLink: string;
    isActive?: boolean;
  }): Promise<AssetListingDto | null> {
    isValidArgument(isValidId(listingData.assetId), 'Invalid asset ID format');
    isValidArgument(
      isValidId(listingData.dealerId),
      'Invalid dealer ID format'
    );
    isValidArgument(
      !!listingData.productLink?.trim(),
      'Product link is required'
    );

    const asset = await this.assetRepository.findById(listingData.assetId);
    const dealer = await this.dealerRepository.findById(listingData.dealerId);

    isFoundResource(
      !!asset,
      'Asset not found with ID: %s',
      listingData.assetId
    );
    isFoundResource(
      !!dealer,
      'Dealer not found with ID: %s',
      listingData.dealerId
    );

    const listing = await this.assetListingRepository.create({
      asset,
      dealer,
      productLink: listingData.productLink,
      isActive: listingData.isActive ?? true,
    });

    return this.mapToDto(listing);
  }

  async updateListing(
    id: string,
    updates: Partial<{
      productLink: string;
      isActive: boolean;
    }>
  ): Promise<AssetListingDto | null> {
    isValidArgument(isValidId(id), 'Invalid listing ID format');

    const listing = await this.assetListingRepository.update(id, updates);

    return listing ? this.mapToDto(listing) : null;
  }

  async deleteListing(id: string): Promise<boolean> {
    isValidArgument(isValidId(id), 'Invalid listing ID format');

    return this.assetListingRepository.delete(id);
  }

  private mapToDto(listing: AssetListing): AssetListingDto {
    return {
      id: listing.id,
      asset: {
        id: listing.asset.id,
        name: listing.asset.name,
        manufacturerName: listing.asset.manufacturerName,
        assetType: listing.asset.assetType,
        metalType: listing.asset.metalType,
        weightGrams: listing.asset.weightGrams,
        purity: listing.asset.purity,
        createdAt: listing.asset.createdAt,
        updatedAt: listing.asset.updatedAt,
      },
      dealer: {
        id: listing.dealer.id,
        name: listing.dealer.name,
        websiteUrl: listing.dealer.websiteUrl,
        scrapingConfig: listing.dealer.scrapingConfig,
        isActive: listing.dealer.isActive,
        createdAt: listing.dealer.createdAt,
      },
      productLink: listing.productLink,
      isActive: listing.isActive,
      lastScrapedAt: listing.lastScrapedAt,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    };
  }
}
