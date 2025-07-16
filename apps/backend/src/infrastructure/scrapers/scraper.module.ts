import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ScraperService } from './scraper.service';
import { AssetScrapingSchedulerService } from '../scheduling/asset-scraping-scheduler.service';
import { DatabaseModule } from '../database/database.module';
import { GetPriceHistoryUseCase } from '../../application/use-cases/get-price-history.use-case';
import { ApmexScraperStrategy } from './strategies/vendor-specific/apmex-scraper.strategy';

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule],
  providers: [
    ScraperService,
    AssetScrapingSchedulerService,
    GetPriceHistoryUseCase,
    ApmexScraperStrategy,
  ],
  exports: [ScraperService, AssetScrapingSchedulerService],
})
export class ScraperModule {
  constructor(
    private readonly scraperService: ScraperService,
    private readonly apmexStrategy: ApmexScraperStrategy
  ) {
    // Register scraper strategies
    this.scraperService.registerStrategy(this.apmexStrategy);
  }
}
