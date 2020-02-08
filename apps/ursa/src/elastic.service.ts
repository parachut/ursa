import { Injectable } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { camelCase } from 'lodash';
import { ProductFilterInput } from './product/dto/product-filter.input';
import { ProductSort } from './product/dto/product-sort.enum';

@Injectable()
export class ElasticService {
  private readonly elasticClient = new Client({
    node: process.env.ELASTIC_URL,
  });

  async searchProducts(
    filter: ProductFilterInput,
    sort: ProductSort,
    from: number,
    size: number,
  ) {
    const lastIndex = sort.lastIndexOf('_');

    let sortBy: any = [
      {
        [camelCase(sort.substr(0, lastIndex))]: {
          order: camelCase(sort.substr(lastIndex)),
        },
      },
    ];

    const filtered = [];

    if (sort.startsWith('LAST_INVENTORY_CREATED')) {
      filtered.push({
        exists: {
          field: 'lastInventoryCreated',
        },
      });
    }

    if (sort.startsWith('POPULAR')) {
      sortBy.unshift({
        _script: {
          type: 'number',
          script: {
            lang: 'painless',
            source: 'doc.stock.value * params.factor + doc.popularity.value',
            params: {
              factor: 100,
            },
          },
          order: 'desc',
        },
      });

      sortBy.push('_score');
    }

    const filterDefault = {
      minPoints: 0,
      maxPoints: 100000,
      ...filter,
    };

    const must: any = [
      {
        range: {
          points: {
            gte: filterDefault.minPoints,
            lte: filterDefault.maxPoints,
          },
        },
      },
    ];

    if (filterDefault.inStock) {
      must.push({
        range: { stock: { gte: 1 } },
      });
    }

    if (filterDefault.search) {
      filtered.push({
        multi_match: {
          fields: [
            'name',
            'aliases',
            'name._2gram',
            'name._3gram',
            'aliases._2gram',
            'aliases._3gram',
          ],
          query: filterDefault.search.toLowerCase(),
          type: 'best_fields',
          tie_breaker: 0.3,
        },
      });

      if (sort === 'DEMAND_DESC') {
        sortBy = [
          {
            _script: {
              type: 'number',
              script: {
                lang: 'painless',
                source: '_score + (params.factor * doc.popularity.value)',
                params: {
                  factor: 0.01,
                },
              },
              order: 'desc',
            },
          },
        ];
      }
    }

    if (filterDefault.brand) {
      must.push({
        term: { brand: filterDefault.brand.toLowerCase() },
      });
    }

    return this.elasticClient.search({
      index: 'products',
      body: {
        track_scores: true,
        from,
        size,
        sort: sortBy,
        query: {
          bool: {
            must: [...must, ...filtered],
          },
        },
      },
    });
  }
}
