import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { ElasticService } from '../elastic.service';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';

@Module({
  imports: [DatabaseModule],
  providers: [ProductService, ProductResolver, ElasticService],
})
export class ProductModule {}
