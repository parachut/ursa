import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { CategoryResolver } from './category.resolver';
import { CategoryService } from './category.service';

@Module({
  imports: [],
  providers: [CategoryService, CategoryResolver],
})
export class CategoryModule {}
