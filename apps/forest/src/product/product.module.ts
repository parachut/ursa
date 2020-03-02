import { Module } from '@nestjs/common';
import { BPController } from './product.controller';
import { InsertNewProductService } from './insert-new-product.service';
import { DatabaseModule } from '@app/database';
import { BHService } from './values/b&h.service';
import { AdoramaService } from './values/adorama.service';
import { InsertValueService } from './insert-values.service';
import { KEHService } from './values/keh.service';
import { MPBService } from './values/mpb.service';
import { DailyFlickrService } from './popularity/flickr.service';
import { Daily500pxService } from './popularity/500px.service';
import { EbayService } from './values/ebay.service';
import { MigratorService } from './migrator.service';
import { AppSearchService } from './app-search.service';
import { BestBuyService } from './values/bestbuy.service';
@Module({
  imports: [DatabaseModule],
  providers: [InsertNewProductService, BHService, InsertValueService, AdoramaService, KEHService, MPBService, DailyFlickrService, Daily500pxService, EbayService, MigratorService, AppSearchService, BestBuyService],
  controllers: [BPController],
})
export class ProductModule { }

