import { DatabaseModule } from '@app/database';

import { Module } from '@nestjs/common';
import { KEHService } from './price-crawlers/keh.service';
import { BestBuyService } from './price-crawlers/bestbuy.service';
import { MPBService } from './price-crawlers/mpb.service';
import { BHService } from './price-crawlers/b&h.service';
import { InsertValueService } from './insert-values.service';
import { SearchService } from './app-search.service';

@Module({
  imports: [DatabaseModule],
  providers: [KEHService, BestBuyService, MPBService, BHService, InsertValueService, SearchService],
  exports: [KEHService, BHService, MPBService, BestBuyService, InsertValueService],
})
export class ProductModule { }
