import { CalculatorModule } from '@app/calculator';
import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { CategoryService } from '../category/category.service';
import { ElasticService } from '../elastic.service';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';

@Module({
  imports: [DatabaseModule, CalculatorModule],
  providers: [ProductService, ProductResolver, ElasticService, CategoryService],
})
export class ProductModule {}
