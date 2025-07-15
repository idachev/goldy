import { Injectable } from '@nestjs/common';
import { BaseScraperStrategy } from './base-scraper.strategy';
import { ScrapedPriceData } from '../scraper.strategy.interface';
import { AssetListing } from '../../../../domain/entities/asset-listing.entity';

@Injectable()
export class ApmexScraperStrategy extends BaseScraperStrategy {
  canHandle(dealerName: string): boolean {
    return dealerName.toLowerCase().includes('apmex');
  }

  async scrapePrice(assetListing: AssetListing): Promise<ScrapedPriceData | null> {
    try {
      const config = assetListing.dealer.scrapingConfig;
      const selectors = config.selectors;

      this.logger.log(`Scraping APMEX price for: ${assetListing.productLink}`);

      const html = await this.fetchPageContent(
        assetListing.productLink,
        selectors.priceContainer || '.price-container'
      );

      if (!html) {
        this.logger.warn(`Failed to fetch content for ${assetListing.productLink}`);
        return null;
      }

      const $ = this.parseHtmlContent(html);

      // Extract sell price
      const sellPriceElement = $(selectors.sellPrice || '.price-sell, .buy-price');
      const sellPriceText = sellPriceElement.text().trim();
      const sellPrice = this.extractPrice(sellPriceText);

      // Extract buy price (if available)
      const buyPriceElement = $(selectors.buyPrice || '.price-buy, .sell-back-price');
      const buyPriceText = buyPriceElement.text().trim();
      const buyPrice = this.extractPrice(buyPriceText);

      // Extract stock status
      const stockElement = $(selectors.stockStatus || '.stock-status, .availability');
      const stockText = stockElement.text().trim();
      const inStock = this.extractInStock(stockText);

      // Extract delivery information
      const deliveryElement = $(selectors.delivery || '.delivery-info, .shipping-info');
      const deliveryText = deliveryElement.text().trim();
      const deliveryDays = this.extractDeliveryDays(deliveryText);

      this.logger.log(`APMEX scraping result: sellPrice=${sellPrice}, buyPrice=${buyPrice}, inStock=${inStock}`);

      return {
        sellPrice,
        buyPrice,
        currency: 'USD',
        deliveryDays,
        inStock,
      };
    } catch (error) {
      this.logger.error(`Error scraping APMEX price:`, error);
      return null;
    }
  }
}