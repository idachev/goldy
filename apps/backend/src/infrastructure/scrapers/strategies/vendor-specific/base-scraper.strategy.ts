import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import {
  IScraperStrategy,
  ScrapedPriceData,
} from '../scraper.strategy.interface';
import { AssetListing } from '../../../../domain/entities/asset-listing.entity';

@Injectable()
export abstract class BaseScraperStrategy implements IScraperStrategy {
  protected readonly logger = new Logger(this.constructor.name);

  abstract canHandle(dealerName: string): boolean;
  abstract scrapePrice(
    assetListing: AssetListing
  ): Promise<ScrapedPriceData | null>;

  protected async fetchPageContent(
    url: string,
    waitForSelector?: string
  ): Promise<string | null> {
    let browser: puppeteer.Browser | null = null;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      if (waitForSelector) {
        await page.waitForSelector(waitForSelector, { timeout: 10000 });
      }

      const content = await page.content();
      return content;
    } catch (error) {
      this.logger.error(`Failed to fetch page content from ${url}:`, error);
      return null;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  protected parseHtmlContent(html: string): cheerio.CheerioAPI {
    return cheerio.load(html);
  }

  protected extractPrice(text: string): number | undefined {
    const cleanText = text.replace(/[,$\s]/g, '');
    const match = cleanText.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : undefined;
  }

  protected extractInStock(text: string): boolean {
    const lowerText = text.toLowerCase();
    return (
      !lowerText.includes('out of stock') &&
      !lowerText.includes('unavailable') &&
      !lowerText.includes('sold out')
    );
  }

  protected extractDeliveryDays(text: string): number | undefined {
    const match = text.match(/(\d+)[\s-]*(?:business\s+)?days?/i);
    return match ? parseInt(match[1]) : undefined;
  }

  protected async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
