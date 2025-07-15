import { Injectable } from '@nestjs/common';
import { AssetDto, AssetType, MetalType } from '@goldy/shared/types';
import { AssetRepository } from '../../infrastructure/database/typeorm/repositories/asset.repository';
import { Asset } from '../../domain/entities/asset.entity';

@Injectable()
export class ManageAssetsUseCase {
  constructor(private readonly assetRepository: AssetRepository) {}

  async getAllAssets(): Promise<AssetDto[]> {
    const assets = await this.assetRepository.findAll();
    return assets.map(this.mapToDto);
  }

  async getAssetById(id: string): Promise<AssetDto | null> {
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
    const asset = await this.assetRepository.create(assetData);
    return this.mapToDto(asset);
  }

  async updateAsset(id: string, updates: Partial<{
    name: string;
    manufacturerName: string;
    assetType: AssetType;
    metalType: MetalType;
    weightGrams: number;
    purity?: string;
  }>): Promise<AssetDto | null> {
    const asset = await this.assetRepository.update(id, updates);
    return asset ? this.mapToDto(asset) : null;
  }

  async deleteAsset(id: string): Promise<boolean> {
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