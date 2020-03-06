require('dotenv').config();
import { Injectable, Logger } from '@nestjs/common';
import bestbuy from 'bestbuy'

@Injectable()
export class BestBuyService {
  private logger = new Logger('BestBuyService')

  async insertValues() {

    const BestBuyClient = new bestbuy(process.env.BESTBUY)
    const departments = [
      'abcat0401000',
      'abcat0410018'
    ]
    const pagesInfo = [];

    try {

      for (const department of departments) {

        try {
          let totalPage: any
          let j = 1

          do {
            console.log('PAGE ON =====', j)
            const bestbuySearchOptionsNew = BestBuyClient
              .products(`categoryPath.id=${department}`, {
                show: "sku,name,regularPrice,salePrice,modelNumber,manufacturer",
                pageSize: 100,
                page: j,
                sort: "name.asc"
              })

            await bestbuySearchOptionsNew.then(async function getProducts(data) {
              const BestBuyItems = data.products;

              totalPage = data.totalPages
              console.log('TOTAL PAGES ------------------->', totalPage)
              for (let i = 0; i < BestBuyItems.length; i++) {

                //BEST BUY ITEM
                const BestBuyProduct = {
                  title: BestBuyItems[i].name,
                  mfr_id: BestBuyItems[i].modelNumber,
                  source: "BESTBUY",
                  all_prices: [
                    {
                      price: Math.round(BestBuyItems[i].regularPrice),
                      condition: "NEW",
                      source: "BESTBUY"
                    }
                  ],
                  sku: BestBuyItems[i].sku
                };
                if (BestBuyProduct.title.includes("Kit") == false) {
                  if (BestBuyProduct.title.includes("with") == false) {

                    const bestbuySearchOptionsUsed = BestBuyClient
                      .openBox(BestBuyProduct.sku)

                    const OpenBox = await bestbuySearchOptionsUsed
                      .then(async function (data) {

                        if (data.results[0] != undefined) {
                          console.log("EXTRAS")
                          const dataOffers = data.results[0].offers;
                          const allPrices = [];

                          for (let i = 0; i < dataOffers.length; i++) {
                            const conditionOffer = dataOffers[i].condition;
                            const priceOffer = dataOffers[i].prices.current;

                            let condition = "";
                            if (conditionOffer === "excellent") {
                              condition = "LIKENEW";
                            }
                            if (conditionOffer === "good") {
                              condition = "EXCELLENT";
                            }
                            if (conditionOffer === "fair") {
                              condition = "USED";
                            }

                            if (condition != "") {
                              if (priceOffer != null) {

                                //BEST BUY ITEMS USED PRICES
                                const obj = {
                                  price: Math.round(priceOffer),
                                  condition: condition,
                                  source: 'BESTBUY'
                                };

                                allPrices.push(obj);
                              }
                            }
                          }

                          const objOpenBox = {
                            allPrices: allPrices
                          };
                          return objOpenBox
                        }

                      })
                      .catch(err => console.log(err.message));


                    if (OpenBox != undefined) {
                      if (OpenBox.allPrices.length != 0 && OpenBox != undefined) {

                        for (let j = 0; j < OpenBox.allPrices.length; j++) {
                          BestBuyProduct.all_prices.push(OpenBox.allPrices[j])
                        }
                      }
                    }
                    console.log(BestBuyProduct.mfr_id)
                    pagesInfo.push(BestBuyProduct);
                  }
                }
              }
            })
              .catch(err => { console.log(err.message) });

            j = j + 1

          }
          while (j <= totalPage)
        }
        catch (e) {
          console.log(e.message)
        }
        console.log("Number of items from pages: " + pagesInfo.length);
      }
    } catch (error) {
      this.logger.error("Could not load BESTBUY", error.stack);
    }

    return pagesInfo

  }
}

