import { CalculatorService } from '@app/calculator';
import { Brand, Category, Product } from '@app/database/entities';
import { Logger } from '@nestjs/common';
import {
  Args,
  Parent,
  Query,
  ResolveProperty,
  Resolver,
} from '@nestjs/graphql';
import { Float, Int } from 'type-graphql';

import { CategoryService } from '../category/category.service';
import { ProductFilterInput } from './dto/product-filter.input';
import { ProductSort } from './dto/product-sort.enum';
import { ProductsResponse } from './dto/products-response.type';
import { ProductService } from './product.service';

@Resolver(of => Product)
export class ProductResolver {
  private readonly logger = new Logger(ProductResolver.name);

  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly calculatorService: CalculatorService,
  ) {}

  @Query(type => Product)
  async product(@Args('slug') slug: string): Promise<Product> {
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
  ): Promise<ProductsResponse> {
    const res = await this.productService.find(filter, sort, from, size);

    return {
      ...res,
      from,
      size,
    };
  }

  @ResolveProperty(type => Brand)
  async brand(@Parent() product: Product): Promise<Brand> {
    return product.$get('brand');
  }

  @ResolveProperty(type => Category)
  async category(@Parent() product: Product): Promise<Category> {
    return product.$get('category');
  }

  @ResolveProperty(type => Float)
  dailyCommission(@Parent() product: Product): number {
    return this.calculatorService.dailyCommission(product.points);
  }

  @ResolveProperty(type => Float)
  estimatedCommission(@Parent() product: Product): number {
    return this.calculatorService.dailyCommission(product.points) * 25;
  }

  @ResolveProperty(type => [Category])
  breadcrumbs(@Parent() product: Product): Promise<Category[]> {
    return this.categoryService.breadCrumbs(product.categoryId);
  }

  @ResolveProperty(type => Int)
  async total(@Parent() product: Product): Promise<number> {
    return product.$count('inventory');
  }
}
