import { AssetType } from '../enums/asset-type.enum.js';

export interface DealerDto {
  id: string;
  name: string;
  websiteUrl: string;
  scrapingConfig: {
    selectors: Record<string, string>;
    urlPatterns: Record<AssetType, string>;
  };
  isActive: boolean;
  createdAt: Date;
}
