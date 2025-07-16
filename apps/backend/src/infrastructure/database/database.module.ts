import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from '../../domain/entities/asset.entity';
import { Dealer } from '../../domain/entities/dealer.entity';
import { AssetListing } from '../../domain/entities/asset-listing.entity';
import { PriceRecord } from '../../domain/entities/price-record.entity';
import { AssetRepository } from './typeorm/repositories/asset.repository';
import { DealerRepository } from './typeorm/repositories/dealer.repository';
import { AssetListingRepository } from './typeorm/repositories/asset-listing.repository';
import { PriceRecordRepository } from './typeorm/repositories/price-record.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/goldy.db',
      entities: [Asset, Dealer, AssetListing, PriceRecord],
      synchronize: true, // Only for development
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([Asset, Dealer, AssetListing, PriceRecord]),
  ],
  providers: [
    AssetRepository,
    DealerRepository,
    AssetListingRepository,
    PriceRecordRepository,
  ],
  exports: [
    AssetRepository,
    DealerRepository,
    AssetListingRepository,
    PriceRecordRepository,
  ],
})
export class DatabaseModule {}
