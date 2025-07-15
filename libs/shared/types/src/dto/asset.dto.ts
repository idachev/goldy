import { AssetType } from '../enums/asset-type.enum.js';
import { MetalType } from '../enums/metal-type.enum.js';

export interface AssetDto {
  id: string;
  name: string;
  manufacturerName: string; // e.g., "PAMP Suisse", "Perth Mint"
  assetType: AssetType;
  metalType: MetalType;
  weightGrams: number;
  purity?: string; // e.g., "999.9", "916"
  createdAt: Date;
  updatedAt: Date;
}