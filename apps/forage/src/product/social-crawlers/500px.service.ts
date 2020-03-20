require('dotenv').config();
import { Injectable, Inject, Logger, } from '@nestjs/common';
import { get, pick } from 'lodash';
import { fetchUrl } from 'fetch'
//import { BigQuery } from "@google-cloud/bigquery";


@Injectable()
export class Daily500pxService {
  private logger = new Logger('Daily500pxService')

  constructor(@Inject('SEQUELIZE') private readonly sequelize) { }

  async daily500px() {
    // const bigQueryClient = new BigQuery();
    // const datasetId = "crawler_500px_flickr";
    // const tableId = "500px_daily";
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
                            // console.log(getID)

                            //  getID;


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
                              lens_name: "",
                              _namefound: true,
                              camera_name: ""
                            }
                            console.log(newPicture)

                            try {
                              const bigQueryFlickr: any = {
                                ...pick(newPicture, BigQueryKeys)
                              };

                              // await bigQueryClient
                              //   .dataset(datasetId)
                              //   .table(tableId)
                              //   .insert([
                              //     bigQueryFlickr
                              //   ]);
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