import { DatabaseModule } from '@app/database';

import { Module } from '@nestjs/common';
import { KEHService } from './price-crawlers/keh.service';
import { BestBuyService } from './price-crawlers/bestbuy.service';
import { MPBService } from './price-crawlers/mpb.service';
import { BHService } from './price-crawlers/b&h.service';
import { InsertValueService } from './insert-values.service';
import { SearchService } from './app-search.service';
import { Daily500pxService } from './social-crawlers/500px.service';
@Module({
  imports: [DatabaseModule],
  providers: [KEHService, BestBuyService, MPBService, BHService, InsertValueService, SearchService, Daily500pxService],
  exports: [KEHService, BHService, MPBService, BestBuyService, InsertValueService, Daily500pxService],
})
export class ProductModule { }
