import { Product } from '../entities/product.entity';
import { QueryTypes } from 'sequelize';

export async function dimensions(product: Product, d3: boolean) {
  if (!product) {
    throw new Error('please supply a product');
  }

  const CategoryModel: any = product.sequelize.models.Category;

  let height = Math.round(product.height || 0);
  let width = Math.round(product.width || 0);
  let depth = Math.round(product.length || 0);

  if (!height || !width || !depth) {
    let categoryIds = [product.categoryId];

    let [catAverage] = await product.sequelize.query(
      'SELECT avg(products.height) as height, avg(products.width) as width, avg(products.length) as depth FROM products where category_id in (:categories)',
      {
        replacements: {
          categories: categoryIds,
        },
        type: QueryTypes.SELECT,
      },
    );

    while (!catAverage.height || !catAverage.width) {
      const [category, categories] = await Promise.all([
        CategoryModel.findOne({
          where: {
            id: categoryIds[categoryIds.length - 1],
          },
        }),
        CategoryModel.findAll({
          where: {
            parentId: categoryIds[categoryIds.length - 1],
          },
        }),
      ]);

      categoryIds = [
        ...(categories || []).map(c => c.id),
        ...categoryIds,
      ].filter(c => !!c);

      if (category && category.parentId) {
        categoryIds.push(category.parentId);
      } else {
        catAverage = {
          width: 15,
          height: 15,
          depth: 15,
        };
      }
      categoryIds = categoryIds.filter((v, i, a) => a.indexOf(v) === i);

      catAverage = await product.sequelize.query(
        'SELECT avg(products.height) as height, avg(products.width) as width, avg(products.length) as depth FROM products where category_id in (:categories)',
        {
          replacements: {
            categories: categoryIds,
          },
          type: QueryTypes.SELECT,
        },
      );

      catAverage = catAverage[0];
    }

    height = height || catAverage.height;
    width = width || catAverage.width;
    depth = depth || catAverage.depth;
  }

  if (d3) {
    return [width, height, depth];
  }

  if (width !== depth) {
    return [width, depth];
  }
  return [width, height];
}
