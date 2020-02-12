import { Product } from '../entities/product.entity';
import { QueryTypes } from 'sequelize';

export async function dimensions(product: Product, d3: boolean) {
  if (!product) {
    throw new Error('please supply a product');
  }

  const CategoryModel: any = product.sequelize.models.Category;

  let height = Math.round(product.height || 0);
  let width = Math.round(product.width || 0);
  let length = Math.round(product.length || 0);

  if (!height || !width || !length) {
    let categoryIds = [product.categoryId];

    let [
      catAverage,
    ] = await product.sequelize.query(
      'SELECT avg(products.height) as height, avg(products.width) as width, avg(products.length) as length FROM products where category_id in (:categories)',
      { replacements: { categories: categoryIds }, type: QueryTypes.SELECT },
    );

    while (!catAverage.height || !catAverage.width) {
      const [category, categories] = await Promise.all([
        CategoryModel.findOne({
          id: categoryIds[categoryIds.length - 1],
        }),
        CategoryModel.findAll({
          parentId: categoryIds[categoryIds.length - 1],
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
          length: 15,
        };
      }
      categoryIds = categoryIds.filter((v, i, a) => a.indexOf(v) === i);

      catAverage = await product.sequelize.query(
        'SELECT avg(products.height) as height, avg(products.width) as width, avg(products.length) as length FROM products where category_id in (:categories)',
        { replacements: { categories: categoryIds }, type: QueryTypes.SELECT },
      );

      catAverage = catAverage[0];
    }

    height = height || catAverage.height;
    width = width || catAverage.width;
    length = length || catAverage.length;
  }

  if (d3) {
    return [width, height, length];
  }

  if (width !== length) {
    return [width, length];
  }
  return [width, height];
}
