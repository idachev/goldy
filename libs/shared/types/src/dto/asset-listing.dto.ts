import { AssetDto } from './asset.dto';
import { DealerDto } from './dealer.dto';

export interface AssetListingDto {
  id: string;
  asset: AssetDto;
  dealer: DealerDto;
  productLink: string;
  isActive: boolean;
  lastScrapedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}