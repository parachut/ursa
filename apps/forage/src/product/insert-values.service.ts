import { Injectable, Inject, Logger } from '@nestjs/common';
import { Product, ProductValue } from '@app/database/entities';

@Injectable()
export class InsertValueService {
  private logger = new Logger('InsertValueService')

  private readonly productRepository: typeof Product = this.sequelize.getRepository(
    'Product',
  );

  private readonly productValueRepository: typeof ProductValue = this.sequelize.getRepository(
    'ProductValue',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) { }

  async insertValues(products): Promise<ProductValue[]> {

    try {
      const conditions = [
        'EXCELLENT', 'LIKENEW', 'NEW', 'USED'
      ]

      const exists = [];
      const insertNew = [];

      for (let i = 0; i < products.length; i++) {

        try {
          const searchProducts = await this.productRepository.findOne({
            where: { mfr: products[i].mfr_id ? products[i].mfr_id : products[i].matched_mfr_id }
          });

          if (searchProducts != null) {
            if (searchProducts.id != undefined) {
              console.log("Product ID SEARCH", searchProducts.id)
              const productId = { id: searchProducts.id }
              const productObj = { ...products[i], ...productId };

              if (productObj.all_prices.length != 0) {

                const searchProducts = await this.productValueRepository.findAll({
                  where: { productId: productObj.id, source: productObj.source }
                });

                if (searchProducts != null && searchProducts.length != 0) {
                  const newArray = { prices: searchProducts };
                  const newArrayAddedPrices = { ...productObj, ...newArray };
                  exists.push(newArrayAddedPrices);
                } else {
                  insertNew.push(productObj);
                }
              }
            }
          }

        } catch (e) {
          console.log('Problem on Check', e.message);
        }
      }
      console.log(exists.length);
      console.log(insertNew.length);

      for (const conditionsEnums of conditions) {

        try {

          const collectInserted = [];
          for (let i = 0; i < insertNew.length; i++) {
            const findSameIds = insertNew.filter(id => id.id === insertNew[i].id);

            if (findSameIds.length === 1) {
              for (let k = 0; k < findSameIds.length; k++) {
                const findSameExcellent = findSameIds[k].all_prices.filter(
                  condition => condition.condition === conditionsEnums
                );

                if (findSameExcellent.length != 0) {
                  console.log(
                    "-----------NEW - First Time Price " + conditionsEnums + "----------------------"
                  );
                  let minExcellent = findSameExcellent[0].price;

                  for (let i = 1; i < findSameExcellent.length; i++) {
                    const v = findSameExcellent[i].price;
                    minExcellent = v < minExcellent ? v : minExcellent;
                  }
                  console.log(minExcellent);

                  console.log(
                    minExcellent,
                    insertNew[i].id,
                    findSameExcellent[0].condition,
                    insertNew[i].mfr_id,
                    insertNew[i].source
                  );

                  await this.productValueRepository.create({
                    value: minExcellent,
                    productId: insertNew[i].id,
                    mfr: insertNew[i].mfr_id ? insertNew[i].mfr_id : insertNew[i].matched_mfr_id,
                    condition: findSameExcellent[0].condition,
                    source: insertNew[i].source,
                    mpbName: (insertNew[i].source === 'MPB') ? insertNew[i].title : null,
                    kehName: (insertNew[i].source === 'KEH') ? insertNew[i].title : null,
                  })
                }
              }
            } else {
              const allConditions = [];

              for (let k = 0; k < findSameIds.length; k++) {
                const findSameExcellent = findSameIds[k].all_prices.filter(
                  condition => condition.condition === conditionsEnums
                );
                if (findSameExcellent.length != 0) {
                  for (let y = 0; y < findSameExcellent.length; y++) {
                    allConditions.push(findSameExcellent[y]);
                  }
                }
              }

              if (allConditions.length != 0) {
                if (collectInserted.includes(insertNew[i].id) === false) {
                  console.log(
                    "-----------NEW - First Time Price(Lowest) More Than once " + conditionsEnums + "----------------------"
                  );
                  let minExcellent = allConditions[0].price;

                  for (let i = 1; i < allConditions.length; i++) {
                    const v = allConditions[i].price;
                    minExcellent = v < minExcellent ? v : minExcellent;
                  }
                  console.log("Inserted: ", collectInserted.length);
                  collectInserted.push(insertNew[i].id);

                  console.log(
                    minExcellent,
                    insertNew[i].id,
                    allConditions[0].condition,
                    insertNew[i].mfr_id,
                    insertNew[i].source
                  );

                  await this.productValueRepository.create({
                    value: minExcellent,
                    mfr: insertNew[i].mfr_id ? insertNew[i].mfr_id : insertNew[i].matched_mfr_id,
                    productId: insertNew[i].id,
                    condition: allConditions[0].condition,
                    source: insertNew[i].source,
                    mpbName: (insertNew[i].source === 'MPB') ? insertNew[i].title : null,
                    kehName: (insertNew[i].source === 'KEH') ? insertNew[i].title : null,
                  })
                }
              }
            }
          }


        } catch (e) { console.log(e) }
      }
      for (const conditionsEnums of conditions) {
        try {

          const collectInserted = [];
          for (let k = 0; k < exists.length; k++) {
            console.log(
              "--------------------------------------------------"
            );
            console.log("###############" + conditionsEnums + "###########");
            console.log(exists[k].source);
            const findSameIds = exists.filter(id => id.id === exists[k].id);

            if (findSameIds.length === 1) {
              console.log("Once");

              //new price to check
              const finOnlyExcellent = exists[k].all_prices.filter(
                condition =>
                  condition.condition === conditionsEnums &&
                  condition.source === exists[k].source
              );

              //checking prices in db
              const findMinExcellentDb = exists[k].prices.filter(
                condition =>
                  condition.condition === conditionsEnums &&
                  condition.source === exists[k].source
              );

              if (
                finOnlyExcellent.length != 0 &&
                findMinExcellentDb.length != 0
              ) {
                console.log("Need Price Check");
                let minExcellentNew = finOnlyExcellent[0].price;

                for (let i = 1; i < finOnlyExcellent.length; i++) {
                  const v = finOnlyExcellent[i].price;
                  minExcellentNew = v < minExcellentNew ? v : minExcellentNew;
                }
                console.log(minExcellentNew);
                let minExcellentDb = parseInt(findMinExcellentDb[0].value);

                for (let i = 1; i < findMinExcellentDb.length; i++) {
                  const v = parseInt(findMinExcellentDb[i].value);
                  minExcellentDb = v < minExcellentDb ? v : minExcellentDb;
                }
                console.log(minExcellentDb);

                if (minExcellentNew < minExcellentDb) {
                  console.log(
                    "---------------------------INSERT " + conditionsEnums + "-------------------------"
                  );
                  console.log(
                    minExcellentNew,
                    exists[k].id,
                    findMinExcellentDb[0].condition,
                    exists[k].mfr_id,
                    exists[k].source
                  );

                  await this.productValueRepository.create({
                    value: minExcellentNew,
                    mfr: exists[k].mfr_id ? exists[k].mfr_id : exists[k].matched_mfr_id,
                    productId: exists[k].id,
                    condition: findMinExcellentDb[0].condition,
                    source: exists[k].source,
                    mpbName: (exists[k].source === 'MPB') ? exists[k].title : null,
                    kehName: (exists[k].source === 'KEH') ? exists[k].title : null,
                  })

                } else {
                  console.log("Price in DB is still lower than the new");
                }
              } else {
                if (
                  finOnlyExcellent.length != 0 &&
                  findMinExcellentDb.length === 0
                ) {
                  let minExcellentNew = finOnlyExcellent[0].price;

                  for (let i = 1; i < finOnlyExcellent.length; i++) {
                    const v = finOnlyExcellent[i].price;
                    minExcellentNew = v < minExcellentNew ? v : minExcellentNew;
                  }
                  console.log(
                    "---------------------------INSERT " + conditionsEnums + "-------------------------"
                  );
                  console.log(
                    minExcellentNew,
                    exists[k].id,
                    finOnlyExcellent[0].condition,
                    exists[k].mfr_id,
                    exists[k].source
                  );

                  await this.productValueRepository.create({
                    value: minExcellentNew,
                    mfr: exists[k].mfr_id ? exists[k].mfr_id : exists[k].matched_mfr_id,
                    productId: exists[k].id,
                    condition: finOnlyExcellent[0].condition,
                    source: exists[k].source,
                    mpbName: (exists[k].source === 'MPB') ? exists[k].title : null,
                    kehName: (exists[k].source === 'KEH') ? exists[k].title : null,
                  })
                } else {
                  console.log("No New Price");
                }
              }
            } else {
              console.log("More than Once");
              console.log(findSameIds.length);
              const onlyExcellentArray = [];
              for (let q = 0; q < findSameIds.length; q++) {
                const finOnlyExcellent = findSameIds[q].all_prices.filter(
                  condition =>
                    condition.condition === conditionsEnums &&
                    condition.source === exists[k].source
                );
                if (finOnlyExcellent.length != 0) {
                  for (let y = 0; y < finOnlyExcellent.length; y++) {
                    onlyExcellentArray.push(finOnlyExcellent[y]);
                  }
                }
              }

              if (onlyExcellentArray.length != 0) {


                if (collectInserted.includes(exists[k].id) === false) {


                  console.log("Inserted: ", collectInserted.length);
                  collectInserted.push(exists[k].id);

                  let minExcellentNew = onlyExcellentArray[0].price;

                  for (let i = 1; i < onlyExcellentArray.length; i++) {
                    const v = onlyExcellentArray[i].price;
                    minExcellentNew = v < minExcellentNew ? v : minExcellentNew;
                  }
                  console.log(minExcellentNew);

                  const findMinExcellentDb = exists[k].prices.filter(
                    condition =>
                      condition.condition === conditionsEnums &&
                      condition.source === exists[k].source
                  );

                  if (findMinExcellentDb.length != 0) {

                    let minExcellentDb = parseInt(findMinExcellentDb[0].value);

                    for (let i = 1; i < findMinExcellentDb.length; i++) {
                      const v = parseInt(findMinExcellentDb[i].value);

                      minExcellentDb = (v < minExcellentDb) ? v : minExcellentDb;
                    }
                    console.log(minExcellentDb);

                    if (minExcellentNew < minExcellentDb) {

                      console.log(
                        "---------------------------INSERT " + conditionsEnums + "-------------------------"
                      );
                      console.log(
                        minExcellentNew,
                        exists[k].id,
                        findMinExcellentDb[0].condition,
                        exists[k].mfr_id,
                        exists[k].source
                      );

                      await this.productValueRepository.create({
                        value: minExcellentNew,
                        productId: exists[k].id,
                        mfr: exists[k].mfr_id ? exists[k].mfr_id : exists[k].matched_mfr_id,
                        condition: findMinExcellentDb[0].condition,
                        source: exists[k].source,
                        mpbName: (exists[k].source === 'MPB') ? exists[k].title : null,
                        kehName: (exists[k].source === 'KEH') ? exists[k].title : null,
                      })

                    } else {
                      console.log("Price in DB is still lower than the new");
                    }
                  } else {

                    console.log("Need Insert Since there is nothing in DB");
                    console.log(
                      "---------------------------INSERT " + conditionsEnums + "-------------------------"
                    );
                    console.log(
                      minExcellentNew,
                      exists[k].id,
                      onlyExcellentArray[0].condition,
                      exists[k].mfr_id,
                      exists[k].source
                    );

                    await this.productValueRepository.create({
                      value: minExcellentNew,
                      mfr: exists[k].mfr_id ? exists[k].mfr_id : exists[k].matched_mfr_id,
                      productId: exists[k].id,
                      condition: onlyExcellentArray[0].condition,
                      source: exists[k].source,
                      mpbName: (exists[k].source === 'MPB') ? exists[k].title : null,
                      kehName: (exists[k].source === 'KEH') ? exists[k].title : null,
                    })
                  }
                }

              } else {
                console.log("No new " + conditionsEnums + " Price");
              }
            }
          }

        } catch (e) { console.log(e) }
      }
      return
    } catch (e) {
      this.logger.error("Insert Value Problem", e.stack);
    }
  }
}
