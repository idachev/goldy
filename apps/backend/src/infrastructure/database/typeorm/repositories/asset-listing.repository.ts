import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetListing } from '../../../../domain/entities/asset-listing.entity';
import { IAssetListingRepository } from '../../../../domain/repositories/asset-listing.repository.interface';

@Injectable()
export class AssetListingRepository implements IAssetListingRepository {
  constructor(
    @InjectRepository(AssetListing)
    private readonly repository: Repository<AssetListing>
  ) {}

  async findAll(): Promise<AssetListing[]> {
    return this.repository.find({
      relations: ['asset', 'dealer', 'priceRecords'],
    });
  }

  async findById(id: string): Promise<AssetListing | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['asset', 'dealer', 'priceRecords'],
    });
  }

  async findByAssetId(assetId: string): Promise<AssetListing[]> {
    return this.repository.find({
      where: { asset: { id: assetId } },
      relations: ['asset', 'dealer', 'priceRecords'],
    });
  }

  async findByDealerId(dealerId: string): Promise<AssetListing[]> {
    return this.repository.find({
      where: { dealer: { id: dealerId } },
      relations: ['asset', 'dealer', 'priceRecords'],
    });
  }

  async findActive(): Promise<AssetListing[]> {
    return this.repository.find({
      where: { isActive: true },
      relations: ['asset', 'dealer'],
    });
  }

  async findForScraping(): Promise<AssetListing[]> {
    return this.repository.find({
      where: {
        isActive: true,
        dealer: { isActive: true },
      },
      relations: ['asset', 'dealer'],
    });
  }

  async create(
    listing: Omit<
      AssetListing,
      'id' | 'createdAt' | 'updatedAt' | 'priceRecords'
    >
  ): Promise<AssetListing> {
    const newListing = this.repository.create(listing);
    return this.repository.save(newListing);
  }

  async update(
    id: string,
    listing: Partial<AssetListing>
  ): Promise<AssetListing | null> {
    await this.repository.update(id, listing);
    return this.findById(id);
  }

  async updateLastScrapedAt(id: string): Promise<void> {
    await this.repository.update(id, { lastScrapedAt: new Date() });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }
}
