import { Product } from '@app/database/entities';
import { Logger } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Int } from 'type-graphql';

import { ProductFilterInput } from './dto/product-filter.input';
import { ProductSort } from './dto/product-sort.enum';
import { ProductsResponse } from './dto/products-response.type';
import { ProductService } from './product.service';

@Resolver(of => Product)
export class ProductResolver {
  private readonly logger = new Logger(ProductResolver.name);

  constructor(private readonly productService: ProductService) {}

  @Query(type => Product)
  async product(@Args('slug') slug: string) {
    return this.productService.findOne(slug);
  }

  @Query(returns => ProductsResponse)
  async products(
    @Args({ name: 'from', type: () => Int, nullable: true, defaultValue: 0 })
    from: number,
    @Args({ name: 'size', type: () => Int, nullable: true, defaultValue: 10 })
    size: number,
    @Args({ name: 'filter', type: () => ProductFilterInput, nullable: true })
    filter: ProductFilterInput,
    @Args({
      name: 'sort',
      type: () => ProductSort,
      nullable: true,
      defaultValue: ProductSort['ID_DESC'],
    })
    sort: ProductSort,
  ) {
    const res = await this.productService.find(filter, sort, from, size);

    return {
      ...res,
      from,
      size,
    };
  }
}
