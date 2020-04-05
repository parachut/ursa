import { Product, ProductView } from '@app/database/entities';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Op, fn, col } from 'sequelize';

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

  private readonly productViewRepository: typeof ProductView = this.sequelize.getRepository(
    'ProductView',
  );

  constructor(
    @Inject('SEQUELIZE') private readonly sequelize,
    private readonly elasticService: ElasticService,
  ) {}

  async findOne(slug: string, userId: string, ipAddress: string) {
    const product = await this.productRepository.findOne({
      where: {
        slug,
      },
    });

    if (!product) {
      throw new NotFoundException(slug);
    }

    try {
      await this.productViewRepository.create({
        ipAddress,
        productId: product.id,
        userId: userId || null,
      });
    } catch (e) {
      // do nothing;
    }

    return product;
  }

  async find(
    filter: ProductFilterInput,
    sort: ProductSort,
    from: number,
    size: number,
  ): Promise<ProductFindResponse> {
    const body = await this.elasticService.searchProducts(
      filter,
      sort,
      from,
      size,
    );

    const products = await this.productRepository.findAll({
      where: { id: { [Op.in]: body.results.map(hit => hit.id.raw) } },
    });

    return {
      items: body.results.map(hit => products.find(i => i.id === hit.id.raw)),
      total: body.meta.page.total_results,
      hasMore: body.meta.page.total_results < from + size,
    };
  }

  async estimatedEarnings(product: Product) {
    if (
      product.estimatedEarnings &&
      product.estimatedEarnings.length &&
      !isNaN(product.estimatedEarnings[0])
    ) {
      return product.estimatedEarnings;
    }

    const [minMax] = (await this.productRepository.findAll({
      attributes: [
        [fn('max', col('demand')), 'max'],
        [fn('min', col('demand')), 'min'],
      ],
    })) as any;

    let normalizedDemand =
      (product.demand - minMax.get('min')) /
      (minMax.get('max') - minMax.get('min'));

    if (normalizedDemand > 0.8) {
      normalizedDemand = 0.8;
    }

    const twelve = Array.from(Array(12).keys());
    const demandCurve = twelve.map(() => {
      return (Math.min(Math.random() + normalizedDemand, 1) * 100) / 100;
    });

    const max = Math.max(...demandCurve);
    const min = Math.min(...demandCurve);

    product.estimatedEarnings = demandCurve.map(d => (d - min) / (max - min));
    await product.save();

    return demandCurve;
  }
}
