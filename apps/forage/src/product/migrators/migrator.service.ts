import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import {
  Product,
  Category,
  ProductValue
} from '@app/database/entities';
import AppSearchClient from '@elastic/app-search-node'
import fs from 'fs'
const hostIdentifier = 'host-qg17uk'
const apiKey = 'private-2w3xpb17ov3kqf1w7ewbpiaq'
const client = new AppSearchClient(hostIdentifier, apiKey)

@Injectable()
export class MigratorService {
  private logger = new Logger('MigratorService');

  private readonly productRepository: typeof Product = this.sequelize.getRepository(
    'Product',
  );

  private readonly categoryRepository: typeof Category = this.sequelize.getRepository(
    'Category',
  );
  private readonly productValueRepository: typeof ProductValue = this.sequelize.getRepository(
    'ProductValue',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) { }

  async migrator() {

    // const categories = await this.categoryRepository.findAll({});

    // function findBreadCrumbs(cat: Category): Category[] {
    //   const _categories = [cat];

    //   const getParent = async (child: Category) => {
    //     if (child.parentId) {
    //       const parent = categories.find((cate) => cate.id === child.parentId);

    //       if (parent) {
    //         _categories.push(parent);

    //         if (parent.parentId) {
    //           getParent(parent);
    //         }
    //       }
    //     }
    //   };

    //   getParent(cat);

    //   return _categories;
    // }

    // const products = await this.productRepository.findAll({
    //   include: ['brand', 'category', 'inventory'],
    // });


    // const dataset: any = products.map((product) => {
    //   let cats = null;
    //   if (product.category) {
    //     cats = findBreadCrumbs(product.category);
    //   }

    //   //console.log(cats)
    //   const productr = {
    //     id: product.id,
    //     name: product.name,
    //     mfr: product.mfr,
    //     camera: cats
    //       ? !!cats.find((category) => category.name.search('Cameras') !== -1)
    //       : false,
    //     lens: cats
    //       ? !!cats.find((category) => category.name.search('Lenses') !== -1)
    //       : false,

    //     category_name: product.category
    //       ? product.category.name : null,
    //     category_id: product.category
    //       ? product.category.id : null,
    //     category_slug: product.category
    //       ? product.category.slug : null,
    //     brand_id: product.brand
    //       ? product.brand.id : null,
    //     brand_name: product.brand
    //       ? product.brand.name : null,
    //     brand_slug: product.brand
    //       ? product.brand.slug : null,

    //     slug: product.slug,

    //     stock: product.inventory.filter((i) => i.status === 'INWAREHOUSE').length,
    //     points: product.points,
    //     images: product.images ? product.images[0] : null,
    //     popularity: product.popularity,
    //     demand: product.demand,
    //     last_inventory_created: product.lastInventoryCreated,
    //   }


    //   let i = 0;
    //   while (i < cats.length - 1) {
    //     const newName = cats.length - i - 1
    //     productr['category' + (newName)] = cats[i].name
    //     i++;
    //   }


    //   return productr;
    // })
    // console.log(dataset[0])


    // let ii = 0;

    // //dataset.length
    // while (ii < dataset.length) {
    //   const smallSet = dataset.slice(ii, ii + 4999);

    //   if (smallSet.length) {

    //     fs.writeFile(
    //       `./products${ii}.json`,
    //       JSON.stringify(smallSet, null, 2),
    //       err =>
    //         err ? console.error("Data not written", err) : console.log("Data written")
    //     );

    //   }


    //   ii = ii + 4999
    // }


    const productsValues = await this.productValueRepository.findAll({});


    for (let i = 0; i < productsValues.length; i++) {

      const products = await this.productRepository.findOne({
        where: { id: productsValues[i].productId },
      });
      console.log(products.mfr)

      await this.productValueRepository
        .update(
          {
            mfr: products.mfr,

          },
          { where: { product_id: productsValues[i].productId } }
        )
    }

    return

  }



}