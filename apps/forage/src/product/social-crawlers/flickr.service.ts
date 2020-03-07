require('dotenv').config();
import { Injectable, Inject, Logger, } from '@nestjs/common';
import { pick } from 'lodash';
import { BigQuery } from "@google-cloud/bigquery";
const bigQueryClient = new BigQuery();
const datasetId = "crawler_500px_flickr";
const tableId = "flickr";
const BigQueryKeys = [
  'id',
  'last_crawl',
  'title',
  'img_src',
  'desc',
  'camera',
  'lens',
  'location_coordinates',
  'location',
  'date_taken',
  'photographer',
  'photographer_link',
  'f',
  'mm',
  'iso',
  's',
  'likes',
  'view',
  'comments',
  'tags',
  'url',
  'exif',
  'lens_name',
  '_namefound',
  'camera_name'
];
import Flickr from 'flickr-sdk'
const flickr = new Flickr(
  Flickr.OAuth.createPlugin(
    process.env.FLICKR_API_KEY,
    process.env.FLICKR_SECRET,
    process.env.FLICKR_ACCESS_TOKEN,
    process.env.FLICKR_ACCESS_TOKEN_SECRET
  )
);
@Injectable()
export class DailyFlickrService {
  private logger = new Logger('DailyFlickrService')

  constructor(@Inject('SEQUELIZE') private readonly sequelize) { }

  async dailyFlickr() {

    let numberOfPages;
    let i = 1
    try {

      do {
        const getPics = await flickr.photos.getRecent({
          page: i,
          per_page: 100
        })
          .then(res => JSON.parse(res.text));

        numberOfPages = getPics.photos.pages;
        console.log(numberOfPages);
        console.log("Page", getPics.photos.page)
        console.log(getPics.photos.photo.length)

        for (let g = 0; g < getPics.photos.photo.length; g++) {

          try {
            console.log(getPics.photos.photo[g].id)

            const flickrPicture = await Promise.all([
              flickr.photos
                .getInfo({
                  photo_id: getPics.photos.photo[g].id
                }).then(res => JSON.parse(res.text)),
              flickr.photos
                .getFavorites({
                  photo_id: getPics.photos.photo[g].id
                }).then(res => JSON.parse(res.text)),
              flickr.photos
                .getExif({
                  photo_id: getPics.photos.photo[g].id
                }).then(res => JSON.parse(res.text)),
              flickr.photos
                .getSizes({
                  photo_id: getPics.photos.photo[g].id
                }).then(res => JSON.parse(res.text))
            ])


            if (flickrPicture[2].photo.camera != '') {
              if (flickrPicture[2].photo.camera != null) {

                //GETTING PICTURE SRC 
                const getSizeOriginal = flickrPicture[3].sizes.size.find(x => x.label === "Original");
                const originalSize = getSizeOriginal ? getSizeOriginal.source : flickrPicture[3].sizes.size.pop().source;

                //GETTING EXIF INFO
                const getExif = [];
                for (const detail of flickrPicture[2].photo.exif) {
                  const exifObj = {
                    label: detail.label,
                    value: detail.raw._content
                  };
                  getExif.push(exifObj);
                }

                //GETTING LENS NAME 
                const getLens = getExif.find(x => x.label === "Lens Model");
                const lensName = getLens ? getLens.value : '';

                //GETTING LOCATION COORDINATES
                let locationCoordinates;
                if (flickrPicture[0].photo.location) {
                  locationCoordinates = {
                    Latitude: flickrPicture[0].photo.location.latitude,
                    Longitude: flickrPicture[0].photo.location.longitude
                  };
                } else {
                  locationCoordinates = {
                    Latitude: 0,
                    Longitude: 0
                  };
                }

                //GETTING LOCATION NAME 
                let locationName = '';
                if (flickrPicture[0].photo.location) {
                  try {
                    locationName =
                      flickrPicture[0].photo.location.locality._content + ", " + flickrPicture[0].photo.location.country._content;
                  } catch (e) {
                    try {
                      locationName =
                        flickrPicture[0].photo.location.country._content;
                    } catch (e) {
                      locationName = ''
                    }
                  }
                }

                //GETTING DATE TAKEN
                const dateTaken = flickrPicture[0].photo.dates.taken ? new Date(flickrPicture[0].photo.dates.taken).getTime() / 1000 : 0

                //GETTING LINK TO THE PICTURE OWNER
                const urlOwner = "https://www.flickr.com/photos/" + flickrPicture[0].photo.owner.path_alias + "/";

                //GETTING TAGS
                const getTags = [];
                for (const detail of flickrPicture[0].photo.tags.tag) {
                  getTags.push(detail.raw);
                }

                //FINDING VALUES IN EXIF INFO
                const getF = getExif.find(x => x.label === "Aperture");
                const getISO = getExif.find(x => x.label === "ISO Speed");
                const getMM = getExif.find(x => x.label === "Focal Length");
                const getS = getExif.find(x => x.label === "Exposure");

                const valueF = getF ? parseFloat(getF.value.replace(" mm", "")) : 0;
                const valueISO = getISO ? parseInt(getISO.value) : 0;
                const valueMM = getMM ? parseInt(getMM.value) : 0;
                const valueS = getS ? Math.round(eval(getS.value) * 10000) / 10000 : 0;

                const newPicture = {
                  id: parseFloat(flickrPicture[0].photo.id),
                  last_crawl: new Date().getTime() / 1000,
                  title: flickrPicture[0].photo.title._content,
                  img_src: originalSize,
                  desc: flickrPicture[0].photo.description._content,
                  camera: flickrPicture[2].photo.camera,
                  lens: lensName,
                  location_coordinates: locationCoordinates,
                  location: locationName,
                  date_taken: dateTaken,
                  photographer: flickrPicture[0].photo.owner.realname,
                  photographer_link: urlOwner,
                  f: valueF,
                  mm: valueMM,
                  iso: valueISO,
                  s: valueS,
                  likes: flickrPicture[1].photo.total,
                  view: flickrPicture[0].photo.views,
                  comments: flickrPicture[0].photo.comments._content,
                  tags: getTags,
                  url: flickrPicture[0].photo.urls.url[0]._content,
                  exif: getExif,
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

              }
            }
          } catch (e) {
            if (e.message === "Permission denied") {
              console.log("Permission denied")
            }
          }

        }
        i = i + 1;
      } while (i <= numberOfPages)
    } catch (e) {
      console.log(e.message);
      this.logger.error("Could not load/ Run Flickr API", e.stack);
    }
    return
  }


}