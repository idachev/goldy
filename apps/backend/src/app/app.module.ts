import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PresentationModule } from '../presentation/presentation.module';
import { ApplicationModule } from '../application/application.module';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { ScraperModule } from '../infrastructure/scrapers/scraper.module';

@Module({
  imports: [
    DatabaseModule,
    ApplicationModule,
    ScraperModule,
    PresentationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
