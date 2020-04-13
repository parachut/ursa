import { Injectable } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { snakeCase } from 'lodash';
import { ProductFilterInput } from './product/dto/product-filter.input';
import { ProductSort } from './product/dto/product-sort.enum';
import AppSearchClient from '@elastic/app-search-node';

/**
 * 
 * @Field(type => String, { nullable: true })
  search?: string;

  @Field(type => String, { nullable: true })
  brand?: string;

  @Field(type => Boolean, { nullable: true, defaultValue: false })
  inStock?: boolean;

  @Field(type => Int, { nullable: true, defaultValue: 100000 })
  maxPoints?: number;

  @Field(type => Int, { nullable: true, defaultValue: 0 })
  minPoints?: number;
 */

@Injectable()
export class ElasticService {
  private readonly elasticClient = new AppSearchClient(
    'host-qg17uk',
    'private-2w3xpb17ov3kqf1w7ewbpiaq',
  );

  async searchProducts(
    filter: ProductFilterInput,
    sort: ProductSort,
    from: number,
    size: number,
  ) {
    const searchFields = { name: {} };
    const resultFields = { id: { raw: {} } };
    const options: any = {
      search_fields: searchFields,
      result_fields: resultFields,
      page: {
        size: size ? Number(size) : 21,
        current: from ? Math.round(Number(size) / Number(from)) + 1 : 1,
      },
    };

    const lastIndex = sort.lastIndexOf('_');

    options.sort = [
      { _score: 'desc' },
      {
        [snakeCase(sort.substr(0, lastIndex))]: snakeCase(
          sort.substr(lastIndex),
        ),
      },
    ];

    const filtered = [];

    if (sort.startsWith('POPULAR')) {
      options.boosts = {
        stock: [
          {
            type: 'functional',
            function: 'linear',
            operation: 'add',
            factor: 2,
          },
        ],
      };
    }

    options.filters = {
      all: [
        {
          points: {
            from: filter.minPoints || 0,
            to: filter.maxPoints || 500000,
          },
        },
      ],
    };

    if (filter.inStock) {
      options.filters.all.push({
        stock: {
          from: 1,
        },
      });
    }

    return this.elasticClient.search('parachut', filter.search || '', options);
  }
}
