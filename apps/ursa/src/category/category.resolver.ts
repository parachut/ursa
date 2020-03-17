import { Category } from '@app/database/entities';
import { Logger } from '@nestjs/common';
import {
  Args,
  Parent,
  Query,
  ResolveProperty,
  Resolver,
} from '@nestjs/graphql';

import { CategoryService } from './category.service';

@Resolver(of => Category)
export class CategoryResolver {
  private readonly logger = new Logger(CategoryResolver.name);

  constructor(private readonly categoryService: CategoryService) {}

  @Query(type => Category)
  async category(@Args('id') id: string): Promise<Category> {
    return this.categoryService.findOne(id);
  }

  @Query(type => [Category])
  async categories(): Promise<Category[]> {
    return this.categoryService.find();
  }

  @ResolveProperty('parent', returns => Category)
  async getPosts(@Parent() category: Category): Promise<Category> {
    return category.$get('parent');
  }
}
