import { Asset } from '../entities/asset.entity';
import { AssetType, MetalType } from '@goldy/shared/types';

export interface IAssetRepository {
  findAll(): Promise<Asset[]>;
  findById(id: string): Promise<Asset | null>;
  findByFilters(filters: {
    assetType?: AssetType;
    metalType?: MetalType;
    manufacturerName?: string;
  }): Promise<Asset[]>;
  create(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'listings'>): Promise<Asset>;
  update(id: string, asset: Partial<Asset>): Promise<Asset | null>;
  delete(id: string): Promise<boolean>;
}