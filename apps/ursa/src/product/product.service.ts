import { Product } from '@app/database/entities';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Op } from 'sequelize';

import { ElasticService } from '../elastic.service';
import { ProductFilterInput } from './dto/product-filter.input';
import { ProductSort } from './dto/product-sort.enum';

interface ProductFindResponse {
  items: Product[];
  total: number;
  hasMore: boolean;
}

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  private readonly productRepository: typeof Product = this.sequelize.getRepository(
    'Product',
  );
  constructor(
    @Inject('SEQUELIZE') private readonly sequelize,
    private readonly elasticService: ElasticService,
  ) {}

  async findOne(slug: string) {
    const product = await this.productRepository.findOne({
      where: {
        slug,
      },
    });

    if (!product) {
      throw new NotFoundException(slug);
    }

    return product;
  }

  async find(
    filter: ProductFilterInput,
    sort: ProductSort,
    from: number,
    size: number,
  ): Promise<ProductFindResponse> {
    const { body } = await this.elasticService.searchProducts(
      filter,
      sort,
      from,
      size,
    );

    const products = await this.productRepository.findAll({
      where: { id: { [Op.in]: body.hits.hits.map(hit => hit._source.id) } },
    });

    return {
      items: body.hits.hits.map(hit =>
        products.find(i => i.id === hit._source.id),
      ),
      total: body.hits.total.value,
      hasMore: body.hits.total.value < from + size,
    };
  }
}
