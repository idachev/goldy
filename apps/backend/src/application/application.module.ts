import { Module } from '@nestjs/common';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { ManageAssetsUseCase } from './use-cases/manage-assets.use-case';
import { ManageDealersUseCase } from './use-cases/manage-dealers.use-case';
import { ManageAssetListingsUseCase } from './use-cases/manage-asset-listings.use-case';
import { GetPriceHistoryUseCase } from './use-cases/get-price-history.use-case';
import { PriceAnalyzerService } from './services/price-analyzer.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    ManageAssetsUseCase,
    ManageDealersUseCase,
    ManageAssetListingsUseCase,
    GetPriceHistoryUseCase,
    PriceAnalyzerService,
  ],
  exports: [
    ManageAssetsUseCase,
    ManageDealersUseCase,
    ManageAssetListingsUseCase,
    GetPriceHistoryUseCase,
    PriceAnalyzerService,
  ],
})
export class ApplicationModule {}
