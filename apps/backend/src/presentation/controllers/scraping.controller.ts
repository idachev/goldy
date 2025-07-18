import {
  Controller,
  Post,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ScraperService } from '../../infrastructure/scrapers/scraper.service';

interface ScrapingResult {
  success: number;
  failed: number;
  results: Array<{ listingId: string; success: boolean; error?: string }>;
}

interface ScrapingStatus {
  isRunning: boolean;
  lastRun?: Date;
  nextScheduledRun?: Date;
  totalActiveListings: number;
}

@Controller('api/scraping')
export class ScrapingController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('trigger')
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerScraping(): Promise<ScrapingResult> {
    return this.scraperService.scrapeAllActiveListings();
  }

  @Post('trigger/listing/:listingId')
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerScrapingForListing(
    @Param('listingId') listingId: string
  ): Promise<{
    listingId: string;
    success: boolean;
    error?: string;
  }> {
    const result = await this.scraperService.scrapeListing(listingId);
    return {
      listingId,
      success: result,
      error: result
        ? undefined
        : 'No suitable scraper strategy found or listing not found',
    };
  }

  @Get('status')
  async getScrapingStatus(): Promise<ScrapingStatus> {
    // TODO: Implement scraping status tracking
    return {
      isRunning: false,
      totalActiveListings: 0,
    };
  }
}
