import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AssetType, MetalType } from '@goldy/shared/types';
import { AssetListing } from './asset-listing.entity';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  manufacturerName: string;

  @Column({
    type: 'varchar',
    enum: AssetType,
  })
  assetType: AssetType;

  @Column({
    type: 'varchar',
    enum: MetalType,
  })
  metalType: MetalType;

  @Column('decimal', { precision: 10, scale: 2 })
  weightGrams: number;

  @Column({ nullable: true })
  purity?: string;

  @OneToMany(() => AssetListing, (listing) => listing.asset)
  listings: AssetListing[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
