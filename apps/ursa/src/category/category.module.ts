import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryResolver } from './category.resolver';

@Module({
  imports: [DatabaseModule],
  providers: [CategoryService, CategoryResolver],
})
export class CategoryModule {}
