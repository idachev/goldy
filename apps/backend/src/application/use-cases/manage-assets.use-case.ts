import { Injectable } from '@nestjs/common';
import { AssetDto, AssetType, MetalType } from '@goldy/shared/types';
import { ErrorUtils } from '@goldy/shared/types';
import { IDUtils } from '@goldy/shared/utils';
import { AssetRepository } from '../../infrastructure/database/typeorm/repositories/asset.repository';
import { Asset } from '../../domain/entities/asset.entity';

const { isValidArgument } = ErrorUtils;
const { isValidId } = IDUtils;

@Injectable()
export class ManageAssetsUseCase {
  constructor(private readonly assetRepository: AssetRepository) {}

  async getAllAssets(): Promise<AssetDto[]> {
    const assets = await this.assetRepository.findAll();
    return assets.map(this.mapToDto);
  }

  async getAssetById(id: string): Promise<AssetDto | null> {
    isValidArgument(isValidId(id), 'Invalid asset ID format');

    const asset = await this.assetRepository.findById(id);

    return asset ? this.mapToDto(asset) : null;
  }

  async getAssetsByFilters(filters: {
    assetType?: AssetType;
    metalType?: MetalType;
    manufacturerName?: string;
  }): Promise<AssetDto[]> {
    const assets = await this.assetRepository.findByFilters(filters);
    return assets.map(this.mapToDto);
  }

  async createAsset(assetData: {
    name: string;
    manufacturerName: string;
    assetType: AssetType;
    metalType: MetalType;
    weightGrams: number;
    purity?: string;
  }): Promise<AssetDto> {
    isValidArgument(!!assetData.name?.trim(), 'Asset name is required');
    isValidArgument(
      !!assetData.manufacturerName?.trim(),
      'Manufacturer name is required'
    );
    isValidArgument(!!assetData.assetType, 'Asset type is required');
    isValidArgument(!!assetData.metalType, 'Metal type is required');
    isValidArgument(
      assetData.weightGrams > 0,
      'Weight must be greater than zero'
    );

    const asset = await this.assetRepository.create(assetData);

    return this.mapToDto(asset);
  }

  async updateAsset(
    id: string,
    updates: Partial<{
      name: string;
      manufacturerName: string;
      assetType: AssetType;
      metalType: MetalType;
      weightGrams: number;
      purity?: string;
    }>
  ): Promise<AssetDto | null> {
    isValidArgument(isValidId(id), 'Invalid asset ID format');
    isValidArgument(
      updates.weightGrams === undefined || updates.weightGrams > 0,
      'Weight must be greater than zero'
    );

    const asset = await this.assetRepository.update(id, updates);

    return asset ? this.mapToDto(asset) : null;
  }

  async deleteAsset(id: string): Promise<boolean> {
    isValidArgument(isValidId(id), 'Invalid asset ID format');

    return this.assetRepository.delete(id);
  }

  private mapToDto(asset: Asset): AssetDto {
    return {
      id: asset.id,
      name: asset.name,
      manufacturerName: asset.manufacturerName,
      assetType: asset.assetType,
      metalType: asset.metalType,
      weightGrams: asset.weightGrams,
      purity: asset.purity,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    };
  }
}
