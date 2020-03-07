require('dotenv').config();
import { Injectable, Logger, Inject } from '@nestjs/common';
import AppSearchClient from '@elastic/app-search-node'
import { ProductValue } from '@app/database/entities';

const client = new AppSearchClient(process.env.APPSEARCH_HOSTIDENTIFIER, process.env.APPSEARCH_APIKEY)


@Injectable()
export class SearchService {
  private logger = new Logger('SearchService');

  private readonly productValueRepository: typeof ProductValue = this.sequelize.getRepository(
    'ProductValue',
  );

  constructor(
    @Inject('SEQUELIZE') private readonly sequelize
  ) { }

  async cameraSearch(camerasPrices: any) {

    console.log('Camera')
    let searchResult: any
    let products: any

    if (camerasPrices.source === 'MPB') {
      products = await this.productValueRepository.findOne({
        where: {
          mpbName: camerasPrices.title.replace("with", "").replace("With", "").replace(" Camera", ""),

        },
      });
    }
    else if (camerasPrices.source === 'KEH') {
      products = await this.productValueRepository.findOne({
        where: {
          kehName: camerasPrices.title.replace("with", "").replace("With", "").replace(" Camera", "")

        },
      });
    }

    if (products === null) {
      console.log("+++++++++++++++++++++++++++APP SEARCH +++++++++++++++++++++")
      const query = camerasPrices.title.replace("with", "").replace("With", "").replace(" Camera", "")
      const searchFields = {
        name: {},
      }
      const resultFields = { name: { raw: {} }, mfr: { raw: {} } }
      const options = {
        search_fields: searchFields, filters: { camera: "true" }, result_fields: resultFields,
      }

      const searchOptions = client.search(process.env.APPSEARCH_ENGINE, query, options)

      searchResult = await searchOptions.then(async response => {
        const searchResults = response.results
        return searchResults
      })
        .catch(error => console.log(error.message))

      //CHECK SCORE
      if (searchResult[0] != undefined) {
        console.log("Results")
        console.log(searchResult[0].name.raw)
        console.log(searchResult[0]._meta.score)
        if (searchResult[0]._meta.score > 130) {
          camerasPrices.matched_name = searchResult[0] ? searchResult[0].name.raw : ''
          camerasPrices.matched_name = camerasPrices.matched_name

          camerasPrices.matched_mfr_id = searchResult[0] ? searchResult[0].mfr.raw : ''
          camerasPrices.matched_mfr_id = camerasPrices.matched_mfr_id

          if (camerasPrices.source === 'KEH') {
            await this.productValueRepository
              .update(
                {
                  kehName: camerasPrices.title.replace("with", "").replace("With", "").replace(" Camera", "")

                },
                { where: { mfr: camerasPrices.matched_mfr_id } }
              ).catch(err => console.log(err.message));

          }

        }
      }

    }
    else {

      camerasPrices.matched_mfr_id = products.mfr
      camerasPrices.matched_mfr_id = camerasPrices.matched_mfr_id

      if (camerasPrices.source === 'MPB') {
        await this.productValueRepository
          .update(
            {
              mpbName: camerasPrices.title.replace("with", "").replace("With", "").replace(" Camera", "")

            },
            { where: { mfr: camerasPrices.matched_mfr_id } }
          ).catch(err => console.log(err.message));
      }
      else if (camerasPrices.source === 'KEH') {

        await this.productValueRepository
          .update(
            {
              kehName: camerasPrices.title.replace("with", "").replace("With", "").replace(" Camera", "")

            },
            { where: { mfr: camerasPrices.matched_mfr_id } }
          ).catch(err => console.log(err.message));

      }

    }

    return camerasPrices
  }

  async lensSearch(camerasPrices: any) {

    console.log('Lens')
    let searchResult: any
    let products: any

    if (camerasPrices.source === 'MPB') {
      products = await this.productValueRepository.findOne({
        where: {
          mpbName: camerasPrices.title.replace("with", "").replace("With", "").replace(" Lens", "").replace(" Mount", ""),

        },
      });
    }
    else if (camerasPrices.source === 'KEH') {
      products = await this.productValueRepository.findOne({
        where: {
          kehName: camerasPrices.title.replace("with", "").replace("With", "")

        },
      });
    }

    if (products === null) {
      console.log("+++++++++++++++++++++++++++APP SEARCH +++++++++++++++++++++")
      const query = camerasPrices.title.replace("with", "").replace("With", "").replace(" Lens", "").replace(" Mount", "")
      const searchFields = {
        name: {},
      }
      const resultFields = { name: { raw: {} }, mfr: { raw: {} } }
      const options = {
        search_fields: searchFields, filters: { lens: "true" }, result_fields: resultFields,
      }

      const searchOptions = client.search(process.env.APPSEARCH_ENGINE, query, options)

      searchResult = await searchOptions.then(async response => {
        const searchResults = response.results
        return searchResults
      })
        .catch(error => console.log(error.message))

      //CHECK SCORE
      if (searchResult[0] != undefined) {
        console.log("Results")
        console.log(searchResult[0].name.raw)
        console.log(searchResult[0]._meta.score)
        if (searchResult[0]._meta.score > 140) {
          camerasPrices.matched_name = searchResult[0] ? searchResult[0].name.raw : ''
          camerasPrices.matched_name = camerasPrices.matched_name

          camerasPrices.matched_mfr_id = searchResult[0] ? searchResult[0].mfr.raw : ''
          camerasPrices.matched_mfr_id = camerasPrices.matched_mfr_id

          if (camerasPrices.source === 'KEH') {
            await this.productValueRepository
              .update(
                {
                  kehName: camerasPrices.title.replace("with", "").replace("With", "").replace(" Camera", "")

                },
                { where: { mfr: camerasPrices.matched_mfr_id } }
              ).catch(err => console.log(err.message));

          }

        }
      }

    }
    else {

      camerasPrices.matched_mfr_id = products.mfr
      camerasPrices.matched_mfr_id = camerasPrices.matched_mfr_id

      if (camerasPrices.source === 'MPB') {
        await this.productValueRepository
          .update(
            {
              mpbName: camerasPrices.title.replace("With", "").replace(" Lens", "").replace(" Mount", "")

            },
            { where: { mfr: camerasPrices.matched_mfr_id } }
          ).catch(err => console.log(err.message));
      }
      else if (camerasPrices.source === 'KEH') {
        await this.productValueRepository
          .update(
            {
              kehName: camerasPrices.title.replace("with", "").replace("With", "").replace(" Camera", "")

            },
            { where: { mfr: camerasPrices.matched_mfr_id } }
          ).catch(err => console.log(err.message));

      }

    }

    return camerasPrices

  }

  async accessoriesSearch(lensName: any) {

    let searchResult: any

    try {
      const query = lensName
      const searchFields = {
        name: {},
      }
      const resultFields = { name: { raw: {} }, mfr: { raw: {} } }
      const options = {
        search_fields: searchFields, filters: { lens: "false", camera: "false" }, result_fields: resultFields,
      }

      const searchOptions = client.search(process.env.APPSEARCH_ENGINE, query, options)

      searchResult = await searchOptions.then(async response => {
        const searchResults = response.results
        return searchResults
      })
        .catch(error => console.log(error.message))
    } catch (e) {
      this.logger.error(
        `Failed with App Search (LENS) `,
        e.stack,
      )
    }

    return searchResult

  }

}
