import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { AssetType } from '@goldy/shared/types';
import { AssetListing } from './asset-listing.entity';

@Entity('dealers')
export class Dealer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  websiteUrl: string;

  @Column('json')
  scrapingConfig: {
    selectors: Record<string, string>;
    urlPatterns: Record<AssetType, string>;
  };

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => AssetListing, (listing) => listing.dealer)
  listings: AssetListing[];

  @CreateDateColumn()
  createdAt: Date;
}