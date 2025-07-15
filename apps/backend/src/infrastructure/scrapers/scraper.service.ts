import { Injectable, Logger } from '@nestjs/common';
import { IScraperStrategy } from './strategies/scraper.strategy.interface';
import { AssetListingRepository } from '../database/typeorm/repositories/asset-listing.repository';
import { PriceRecordRepository } from '../database/typeorm/repositories/price-record.repository';
import { GetPriceHistoryUseCase } from '../../application/use-cases/get-price-history.use-case';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private readonly strategies: IScraperStrategy[] = [];

  constructor(
    private readonly assetListingRepository: AssetListingRepository,
    private readonly priceHistoryUseCase: GetPriceHistoryUseCase,
  ) {}

  registerStrategy(strategy: IScraperStrategy): void {
    this.strategies.push(strategy);
  }

  async scrapeAllActiveListings(): Promise<{
    success: number;
    failed: number;
    results: Array<{ listingId: string; success: boolean; error?: string }>;
  }> {
    const activeListings = await this.assetListingRepository.findForScraping();
    this.logger.log(`Starting scrape for ${activeListings.length} active listings`);

    const results = [];
    let success = 0;
    let failed = 0;

    for (const listing of activeListings) {
      try {
        const result = await this.scrapeListing(listing.id);
        if (result) {
          success++;
          results.push({ listingId: listing.id, success: true });
        } else {
          failed++;
          results.push({ 
            listingId: listing.id, 
            success: false, 
            error: 'No suitable scraper strategy found' 
          });
        }
      } catch (error) {
        failed++;
        results.push({
          listingId: listing.id,
          success: false,
          error: error.message,
        });
        this.logger.error(`Failed to scrape listing ${listing.id}:`, error);
      }

      // Add delay between requests to be respectful
      await this.delay(1000);
    }

    this.logger.log(`Scraping completed: ${success} success, ${failed} failed`);
    return { success, failed, results };
  }

  async scrapeListing(listingId: string): Promise<boolean> {
    const listing = await this.assetListingRepository.findById(listingId);
    if (!listing) {
      this.logger.warn(`Listing ${listingId} not found`);
      return false;
    }

    const strategy = this.findStrategy(listing.dealer.name);
    if (!strategy) {
      this.logger.warn(`No scraper strategy found for dealer: ${listing.dealer.name}`);
      return false;
    }

    try {
      const scrapedData = await strategy.scrapePrice(listing);
      if (!scrapedData) {
        this.logger.warn(`No data scraped for listing ${listingId}`);
        return false;
      }

      // Save the price record
      await this.priceHistoryUseCase.createPriceRecord({
        assetListingId: listingId,
        ...scrapedData,
      });

      // Update last scraped timestamp
      await this.assetListingRepository.updateLastScrapedAt(listingId);

      this.logger.log(`Successfully scraped and saved price for listing ${listingId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error processing scraped data for listing ${listingId}:`, error);
      return false;
    }
  }

  private findStrategy(dealerName: string): IScraperStrategy | null {
    return this.strategies.find(strategy => strategy.canHandle(dealerName)) || null;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}