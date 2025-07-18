import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { ScraperModule } from '../infrastructure/scrapers/scraper.module';
import { AssetsController } from './controllers/assets.controller';
import { DealersController } from './controllers/dealers.controller';
import { AssetListingsController } from './controllers/asset-listings.controller';
import { PricesController } from './controllers/prices.controller';
import { ScrapingController } from './controllers/scraping.controller';

@Module({
  imports: [ApplicationModule, ScraperModule],
  controllers: [
    AssetsController,
    DealersController,
    AssetListingsController,
    PricesController,
    ScrapingController,
  ],
})
export class PresentationModule {}
