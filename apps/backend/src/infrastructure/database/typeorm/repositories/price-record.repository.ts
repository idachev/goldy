import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { PriceRecord } from '../../../../domain/entities/price-record.entity';
import { IPriceRecordRepository } from '../../../../domain/repositories/price-record.repository.interface';

@Injectable()
export class PriceRecordRepository implements IPriceRecordRepository {
  constructor(
    @InjectRepository(PriceRecord)
    private readonly repository: Repository<PriceRecord>,
  ) {}

  async findAll(): Promise<PriceRecord[]> {
    return this.repository.find({
      relations: ['assetListing', 'assetListing.asset', 'assetListing.dealer'],
      order: { scrapedAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<PriceRecord | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['assetListing', 'assetListing.asset', 'assetListing.dealer'],
    });
  }

  async findByAssetListingId(assetListingId: string): Promise<PriceRecord[]> {
    return this.repository.find({
      where: { assetListing: { id: assetListingId } },
      relations: ['assetListing', 'assetListing.asset', 'assetListing.dealer'],
      order: { scrapedAt: 'DESC' },
    });
  }

  async findLatestByAssetListingId(assetListingId: string): Promise<PriceRecord | null> {
    return this.repository.findOne({
      where: { assetListing: { id: assetListingId } },
      relations: ['assetListing', 'assetListing.asset', 'assetListing.dealer'],
      order: { scrapedAt: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<PriceRecord[]> {
    return this.repository.createQueryBuilder('price_record')
      .leftJoinAndSelect('price_record.assetListing', 'assetListing')
      .leftJoinAndSelect('assetListing.asset', 'asset')
      .leftJoinAndSelect('assetListing.dealer', 'dealer')
      .where('price_record.scrapedAt >= :startDate', { startDate })
      .andWhere('price_record.scrapedAt <= :endDate', { endDate })
      .orderBy('price_record.scrapedAt', 'DESC')
      .getMany();
  }

  async findLatestPrices(): Promise<PriceRecord[]> {
    return this.repository.createQueryBuilder('price_record')
      .leftJoinAndSelect('price_record.assetListing', 'assetListing')
      .leftJoinAndSelect('assetListing.asset', 'asset')
      .leftJoinAndSelect('assetListing.dealer', 'dealer')
      .distinctOn(['assetListing.id'])
      .orderBy('assetListing.id')
      .addOrderBy('price_record.scrapedAt', 'DESC')
      .getMany();
  }

  async create(priceRecord: Omit<PriceRecord, 'id' | 'scrapedAt'>): Promise<PriceRecord> {
    const newPriceRecord = this.repository.create({
      ...priceRecord,
      scrapedAt: new Date(),
    });
    return this.repository.save(newPriceRecord);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }
}