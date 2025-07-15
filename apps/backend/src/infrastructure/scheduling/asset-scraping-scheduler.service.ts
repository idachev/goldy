import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScraperService } from '../scrapers/scraper.service';

@Injectable()
export class AssetScrapingSchedulerService {
  private readonly logger = new Logger(AssetScrapingSchedulerService.name);
  private isRunning = false;

  constructor(private readonly scraperService: ScraperService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyPriceScraping(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Scraping already in progress, skipping scheduled run');
      return;
    }

    this.logger.log('Starting scheduled price scraping');
    this.isRunning = true;

    try {
      const result = await this.scraperService.scrapeAllActiveListings();
      this.logger.log(
        `Scheduled scraping completed: ${result.success} success, ${result.failed} failed`
      );
    } catch (error) {
      this.logger.error('Error during scheduled scraping:', error);
    } finally {
      this.isRunning = false;
    }
  }


  async triggerManualScraping(): Promise<{
    success: number;
    failed: number;
    results: Array<{ listingId: string; success: boolean; error?: string }>;
  }> {
    if (this.isRunning) {
      throw new Error('Scraping is already in progress');
    }

    this.logger.log('Starting manual price scraping');
    this.isRunning = true;

    try {
      const result = await this.scraperService.scrapeAllActiveListings();
      this.logger.log(
        `Manual scraping completed: ${result.success} success, ${result.failed} failed`
      );
      return result;
    } finally {
      this.isRunning = false;
    }
  }

  async triggerListingScraping(listingId: string): Promise<boolean> {
    this.logger.log(`Starting manual scraping for listing: ${listingId}`);
    
    try {
      const result = await this.scraperService.scrapeListing(listingId);
      this.logger.log(`Manual listing scraping completed: ${result ? 'success' : 'failed'}`);
      return result;
    } catch (error) {
      this.logger.error(`Error during manual listing scraping:`, error);
      throw error;
    }
  }

  getScrapingStatus(): { isRunning: boolean } {
    return { isRunning: this.isRunning };
  }

}