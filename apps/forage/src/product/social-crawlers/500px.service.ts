require('dotenv').config();
import { Injectable, Inject, Logger, } from '@nestjs/common';
import { get, pick } from 'lodash';
import { fetchUrl } from 'fetch'
import { BigQuery } from "@google-cloud/bigquery";
import { Client } from '@elastic/elasticsearch'

@Injectable()
export class Daily500pxService {
  private logger = new Logger('Daily500pxService')

  async daily500px() {
    const elasti = new Client({
      node:
        "https://elastic:acNbgQRsl0OUznitAboYVss6@cb0a068fb8d64b3294ede898764e8f96.us-central1.gcp.cloud.es.io:9243"
    });
    const bigQueryClient = new BigQuery();
    const datasetId = "crawler_500px_flickr";
    const tableId = "500px_daily";
    const BigQueryKeys = [
      'id',
      'last_crawl',
      'name',
      'images',
      'description',
      'camera',
      'lens',
      'longitude',
      'latitude',
      'location',
      'date_created',
      'taken_at',
      'member_id',
      'category',
      'focal_length',
      'aperture',
      'iso',
      'shutter_speed',
      'votes_count',
      'liked',
      'times_viewed',
      'comments_count',
      'tags',
      'rating',
      'feature',
      'lens_name',
      '_namefound',
      'camera_name'
    ];

    try {
      let i = 1
      let totalPageNumbers
      do {

        await fetchUrl(`https://webapi.500px.com/discovery/fresh?rpp=50&feature=fresh&image_size%5B%5D=2048&include_releases=true&include_tags=true&include_states=true&formats=jpeg%2Clytro&page=${i}&rpp=199`
          , async function (error, meta, body) {
            if (error) {
              return console.log('ERROR', error.message || error);
            }
            const pageFresh = JSON.parse(body.toString('utf-8'))
            totalPageNumbers = pageFresh.total_pages

            console.log(totalPageNumbers);
            //pageFresh.photos.length
            for (let i = 0; i < 2; i++) {

              if (pageFresh.photos[i].camera != null) {
                if (pageFresh.photos[i].camera != '') {
                  if (pageFresh.photos[i].camera != '0') {
                    if (pageFresh.photos[i].camera != ' ') {
                      if (pageFresh.photos[i].camera != '  ') {

                        await fetchUrl(`https://api.500px.com/v1/photos?ids=${pageFresh.photos[i].id}&image_size%5B%5D=2048&include_states=1&expanded_user_info=true&include_tags=true&include_geo=true&is_following=true&include_equipment_info=true&include_licensing=true&include_releases=true&liked_by=1&include_vendor_photos=true`
                          , async function (error, meta, body) {
                            if (error) {
                              return console.log('ERROR', error.message || error);
                            }
                            const page = JSON.parse(body.toString('utf-8'))
                            const _id = pageFresh.photos[i].id.toString()
                            const getID = get(page.photos, `${_id}`)

                            const newPicture = {
                              id: parseFloat(getID.id),
                              last_crawl: new Date().getTime() / 1000,
                              name: getID.name,
                              images: getID.images[0].https_url,
                              description: getID.description ? getID.description : null,
                              camera: getID.camera ? getID.camera : null,
                              lens: (getID.lens != '0') ? ((getID.lens != '') ? getID.lens : null) : null,
                              longitude: getID.longitude,
                              latitude: getID.latitude,
                              location: getID.location ? getID.location : null,
                              date_created: new Date(getID.created_at).getTime() / 1000,
                              taken_at: new Date(getID.taken_at).getTime() / 1000,
                              member_id: getID.user_id,
                              category: getID.category,
                              focal_length: (getID.focal_length != 'null') ? getID.focal_length : null,
                              aperture: (getID.aperture != 'null') ? getID.aperture : null,
                              iso: (getID.iso != 'null') ? getID.iso : null,
                              shutter_speed: (getID.shutter_speed != 'null') ? ((getID.shutter_speed != '1/∞') ? getID.shutter_speed : null) : null,
                              votes_count: getID.votes_count,
                              liked: getID.liked,
                              times_viewed: getID.times_viewed,
                              comments_count: getID.comments_count,
                              tags: getID.tags,
                              rating: getID.rating,
                              feature: getID.feature,
                              lens_name: null,
                              _namefound: true,
                              camera_name: null
                            }
                            console.log(newPicture)

                            try {

                              let cameraBody;
                              if (newPicture.camera != null) {
                                try {
                                  const { body } = await elasti.search({
                                    index: "products_crawl",
                                    body: {
                                      query: {
                                        bool: {
                                          must: {
                                            term: {
                                              camera: true
                                            }
                                          },
                                          should: [
                                            {
                                              match: {
                                                aliases: {
                                                  query: newPicture.camera.replace("CORPORATION", "").toLowerCase(),
                                                  operator: "or",
                                                  boost: 10
                                                }
                                              }
                                            },
                                            {
                                              match: {
                                                name: {
                                                  query: newPicture.camera.replace("CORPORATION", "").toLowerCase(),
                                                  operator: 'or',
                                                  analyzer: 'standard',
                                                },
                                              },
                                            },
                                            {
                                              match: {
                                                name: {
                                                  query: newPicture.camera.replace("CORPORATION", "").toLowerCase(),
                                                  operator: 'and',
                                                  boost: 3,
                                                },
                                              },
                                            },
                                          ],
                                        },
                                      },
                                    }
                                  });
                                  cameraBody = body;
                                  console.log("CAMERA  ->", body.hits.hits[0]._source.name)
                                  console.log(body.hits.hits[0]._score)
                                  if (body.hits.hits[0]._score > 46) {
                                    if (body.hits.hits[0]._source.name.includes("Kit") === false) {
                                      newPicture.camera_name = body.hits.hits[0]._source.name
                                      newPicture.camera_name = newPicture.camera_name
                                    }
                                  }
                                } catch (e) { console.log(e.message) }
                              }
                              if (newPicture.lens != null) {
                                try {
                                  let name = newPicture.lens.toLowerCase()

                                  if (typeof cameraBody !== "undefined") {
                                    const brand = cameraBody.hits.hits[0]
                                      ? cameraBody.hits.hits[0]._source.brand.name
                                      : null;

                                    if (brand && name.search(brand.toLowerCase()) === -1) {
                                      name = cameraBody.hits.hits[0]._source.brand.name + " " + name;
                                    }
                                  }
                                  name = name.replace(/[^0-9](?=[0-9])/g, '$& ')
                                  console.log(name)
                                  const { body } = await elasti.search({
                                    index: "products_crawl",
                                    body: {
                                      query: {
                                        bool: {
                                          must: {
                                            term: {
                                              lens: true
                                            }
                                          },
                                          should: [
                                            {
                                              match: {
                                                aliases: {
                                                  query: name,
                                                  operator: "or",
                                                }
                                              }
                                            },
                                            {
                                              match: {
                                                name: {
                                                  query: name,
                                                  operator: 'or',
                                                  analyzer: 'standard',
                                                },
                                              },
                                            },
                                            {
                                              match: {
                                                name: {
                                                  query: name,
                                                  operator: 'and',
                                                  fuzziness: 1,
                                                },
                                              },
                                            },
                                          ],
                                        },
                                      },
                                    }
                                  });

                                  console.log("LENS  ->", body.hits.hits[0]._source.name)
                                  console.log(body.hits.hits[0]._score)
                                  if (body.hits.hits[0]._score > 23) {
                                    if (body.hits.hits[0]._source.name.includes("Kit") === false) {
                                      newPicture.lens_name = body.hits.hits[0]._source.name
                                      newPicture.lens_name = newPicture.lens_name
                                    }
                                  }
                                } catch (e) {
                                  console.log(e.message)
                                }
                              }

                              if (newPicture.camera_name != null || newPicture.lens_name != null) {
                                console.log(newPicture)
                                const bigQueryFlickr: any = {
                                  ...pick(newPicture, BigQueryKeys)
                                };

                                await bigQueryClient
                                  .dataset(datasetId)
                                  .table(tableId)
                                  .insert([
                                    bigQueryFlickr
                                  ]);
                                console.log("Post Inserted");
                              }
                            } catch (e) {
                              console.log(JSON.stringify(e));
                            }
                          })
                      }
                    }
                  }
                }
              }

            }
          });
        i = i + 1

        //totalPageNumbers
      } while (i <= 1)

    }
    catch (e) {
      this.logger.error("Could not load/ 500px", e.stack);
    }

    return
  }


}