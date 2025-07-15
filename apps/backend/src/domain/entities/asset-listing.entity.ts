import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Asset } from './asset.entity';
import { Dealer } from './dealer.entity';
import { PriceRecord } from './price-record.entity';

@Entity('asset_listings')
@Index(['asset', 'dealer'], { unique: true })
export class AssetListing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Asset, (asset) => asset.listings)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @ManyToOne(() => Dealer, (dealer) => dealer.listings)
  @JoinColumn({ name: 'dealer_id' })
  dealer: Dealer;

  @Column()
  productLink: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastScrapedAt?: Date;

  @OneToMany(() => PriceRecord, (record) => record.assetListing)
  priceRecords: PriceRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}