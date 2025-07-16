import { AssetListing } from '../entities/asset-listing.entity';

export interface IAssetListingRepository {
  findAll(): Promise<AssetListing[]>;
  findById(id: string): Promise<AssetListing | null>;
  findByAssetId(assetId: string): Promise<AssetListing[]>;
  findByDealerId(dealerId: string): Promise<AssetListing[]>;
  findActive(): Promise<AssetListing[]>;
  findForScraping(): Promise<AssetListing[]>;
  create(
    listing: Omit<
      AssetListing,
      'id' | 'createdAt' | 'updatedAt' | 'priceRecords'
    >
  ): Promise<AssetListing>;
  update(
    id: string,
    listing: Partial<AssetListing>
  ): Promise<AssetListing | null>;
  updateLastScrapedAt(id: string): Promise<void>;
  delete(id: string): Promise<boolean>;
}
