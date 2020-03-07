require('dotenv').config();
import { Injectable, Inject, Logger, } from '@nestjs/common';
import { get, pick } from 'lodash';
import { fetchUrl } from 'fetch'
import { BigQuery } from "@google-cloud/bigquery";
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


@Injectable()
export class Daily500pxService {
  private logger = new Logger('Daily500pxService')

  constructor(@Inject('SEQUELIZE') private readonly sequelize) { }

  async daily500px() {

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

            //page.photos.length;
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
                           // console.log(get(page.photos, `${_id}`))
                   
                          //  get(page.photos, `${_id}`);

                            const newPicture = {
                              id: parseFloat( get(page.photos, `${_id}`).id),
                              last_crawl: new Date().getTime() / 1000,
                              name:  get(page.photos, `${_id}`).name,
                              images:  get(page.photos, `${_id}`).images[0].https_url,
                              description:  get(page.photos, `${_id}`).description ?  get(page.photos, `${_id}`).description : null,
                              camera:  get(page.photos, `${_id}`).camera ?  get(page.photos, `${_id}`).camera : null,
                              lens: ( get(page.photos, `${_id}`).lens != '0') ? (( get(page.photos, `${_id}`).lens != '') ?  get(page.photos, `${_id}`).lens : null) : null,
                              longitude:  get(page.photos, `${_id}`).longitude,
                              latitude:  get(page.photos, `${_id}`).latitude,
                              location:  get(page.photos, `${_id}`).location ?  get(page.photos, `${_id}`).location : null,
                              date_created: new Date( get(page.photos, `${_id}`).created_at).getTime() / 1000,
                              taken_at: new Date( get(page.photos, `${_id}`).taken_at).getTime() / 1000,
                              member_id:  get(page.photos, `${_id}`).user_id,
                              category:  get(page.photos, `${_id}`).category,
                              focal_length: ( get(page.photos, `${_id}`).focal_length != 'null') ?  get(page.photos, `${_id}`).focal_length : null,
                              aperture: ( get(page.photos, `${_id}`).aperture != 'null') ?  get(page.photos, `${_id}`).aperture : null,
                              iso: ( get(page.photos, `${_id}`).iso != 'null') ?  get(page.photos, `${_id}`).iso : null,
                              shutter_speed: ( get(page.photos, `${_id}`).shutter_speed != 'null') ? (( get(page.photos, `${_id}`).shutter_speed != '1/∞') ?  get(page.photos, `${_id}`).shutter_speed : null) : null,
                              votes_count:  get(page.photos, `${_id}`).votes_count,
                              liked:  get(page.photos, `${_id}`).liked,
                              times_viewed:  get(page.photos, `${_id}`).times_viewed,
                              comments_count:  get(page.photos, `${_id}`).comments_count,
                              tags:  get(page.photos, `${_id}`).tags,
                              rating:  get(page.photos, `${_id}`).rating,
                              feature:  get(page.photos, `${_id}`).feature,
                              lens_name: "",
                              _namefound: true,
                              camera_name: ""
                            }
                            console.log(newPicture)

                            try {
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