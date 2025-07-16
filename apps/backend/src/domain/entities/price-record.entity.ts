import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AssetListing } from './asset-listing.entity';

@Entity('price_records')
export class PriceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AssetListing, (listing) => listing.priceRecords)
  @JoinColumn({ name: 'asset_listing_id' })
  assetListing: AssetListing;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  sellPrice?: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  buyPrice?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  spotPrice?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  premiumPercent?: number;

  @Column({ nullable: true, default: 'USD' })
  currency?: string;

  @Column({ nullable: true })
  deliveryDays?: number;

  @Column({ default: true })
  inStock: boolean;

  @CreateDateColumn()
  @Index()
  scrapedAt: Date;
}
