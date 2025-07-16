import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../../../../domain/entities/asset.entity';
import { IAssetRepository } from '../../../../domain/repositories/asset.repository.interface';
import { AssetType, MetalType } from '@goldy/shared/types';

@Injectable()
export class AssetRepository implements IAssetRepository {
  constructor(
    @InjectRepository(Asset)
    private readonly repository: Repository<Asset>
  ) {}

  async findAll(): Promise<Asset[]> {
    return this.repository.find({
      relations: ['listings', 'listings.dealer'],
    });
  }

  async findById(id: string): Promise<Asset | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['listings', 'listings.dealer'],
    });
  }

  async findByFilters(filters: {
    assetType?: AssetType;
    metalType?: MetalType;
    manufacturerName?: string;
  }): Promise<Asset[]> {
    const query = this.repository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.listings', 'listings')
      .leftJoinAndSelect('listings.dealer', 'dealer');

    if (filters.assetType) {
      query.andWhere('asset.assetType = :assetType', {
        assetType: filters.assetType,
      });
    }

    if (filters.metalType) {
      query.andWhere('asset.metalType = :metalType', {
        metalType: filters.metalType,
      });
    }

    if (filters.manufacturerName) {
      query.andWhere('asset.manufacturerName LIKE :manufacturerName', {
        manufacturerName: `%${filters.manufacturerName}%`,
      });
    }

    return query.getMany();
  }

  async create(
    asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'listings'>
  ): Promise<Asset> {
    const newAsset = this.repository.create(asset);
    return this.repository.save(newAsset);
  }

  async update(id: string, asset: Partial<Asset>): Promise<Asset | null> {
    await this.repository.update(id, asset);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }
}
