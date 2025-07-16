import { AssetDto } from './asset.dto.js';
import { DealerDto } from './dealer.dto.js';

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
