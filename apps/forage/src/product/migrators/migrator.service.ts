import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import {
  Product,
  Category,
  ProductValue,
  Brand,
  ProductPopularity,
  Inventory,
  User,
  Bin,
  Warehouse,
  ProductView
} from '@app/database/entities';
import AppSearchClient from '@elastic/app-search-node'
import fs from 'fs'
const hostIdentifier = 'host-qg17uk'
const apiKey = 'private-2w3xpb17ov3kqf1w7ewbpiaq'
const client = new AppSearchClient(hostIdentifier, apiKey)
import { Client } from '@elastic/elasticsearch'

import { BigQuery } from "@google-cloud/bigquery";
const bigQueryClient = new BigQuery();


import { MongoClient, ObjectID } from "mongodb";

const user = "CC7YolYoTh055CJQ";
const userPassword = "uBOb5Dz03phJpZw8";
const cluster = "cluster0-kto6u";

const url = `mongodb+srv://${user}:${userPassword}@${cluster}.mongodb.net/test?retryWrites=true&w=majority`;


@Injectable()
export class MigratorService {
  private logger = new Logger('MigratorService');

  private readonly viewRepo: typeof ProductView = this.sequelize.getRepository(
    'ProductView',
  );

  private readonly werahouseRepo: typeof Warehouse = this.sequelize.getRepository(
    'Warehouse',
  );
  private readonly productPopRepository: typeof ProductPopularity = this.sequelize.getRepository(
    'ProductPopularity',
  );

  private readonly productRepository: typeof Product = this.sequelize.getRepository(
    'Product',
  );

  private readonly categoryRepository: typeof Category = this.sequelize.getRepository(
    'Category',
  );
  private readonly productValueRepository: typeof ProductValue = this.sequelize.getRepository(
    'ProductValue',
  );

  private readonly brandRepository: typeof Brand = this.sequelize.getRepository(
    'Brand',
  );
  private readonly InventoryRepo: typeof Inventory = this.sequelize.getRepository(
    'Inventory',
  );
  private readonly userRepo: typeof User = this.sequelize.getRepository(
    'User',
  );
  private readonly binRepo: typeof Bin = this.sequelize.getRepository(
    'Bin',
  );
  constructor(@Inject('SEQUELIZE') private readonly sequelize) { }

  async migrator() {


    /*
        const sqlQueryCamera = `SELECT camera_name, COUNT(camera_name) AS Count, 
        SUM( votes_count ) as Likes, MIN(votes_count)as Min_Likes, Max(votes_count)as Max_Likes,
        SUM( times_viewed ) as Views, MIN(times_viewed)as Min_Views, Max(times_viewed)as Max_Views,
        SUM( comments_count ) as Comments, MIN(comments_count)as Min_Comments, Max(comments_count)as Max_Comments,
        AVG( rating ) as Ratings,
        FROM \`parachut-216816.crawler_500px_flickr.500px_popularity\` 
        where camera_name is not null
        and votes_count >-1
        and times_viewed >-1
        and comments_count >-1
        group by camera_name
        having COUNT(camera_name)>20
        order by COUNT(camera_name) DESC `;
    
        const sqlQueryLens = `SELECT lens_name, COUNT(lens_name) AS Count, 
        SUM( votes_count ) as Likes, MIN(votes_count)as Min_Likes, Max(votes_count)as Max_Likes,
        SUM( times_viewed ) as Views, MIN(times_viewed)as Min_Views, Max(times_viewed)as Max_Views,
        SUM( comments_count ) as Comments, MIN(comments_count)as Min_Comments, Max(comments_count)as Max_Comments,
        AVG( rating ) as Ratings,
        FROM \`parachut-216816.crawler_500px_flickr.500px_popularity\` 
        where lens_name is not null
        and votes_count >-1
        and times_viewed >-1
        and comments_count >-1
        group by lens_name
        having COUNT(lens_name)>20
        order by COUNT(lens_name) DESC`;
    
        const options = {
          query: sqlQueryCamera,
          location: 'US',
    
        };
    
        const options2 = {
          query: sqlQueryLens,
          location: 'US',
        };
    
    
        // Run the query
        const [rows] = await bigQueryClient.query(options);
        const [rows2] = await bigQueryClient.query(options2);
    
        //array with bad names
        const badNames = []
        const badNames2 = []
    
        //cameras
        rows.forEach(async row => {
    
          const product = await this.productRepository.findOne(
            {
              where: {
                name: row.camera_name
              },
            },
          );
    
          //console.log(row)
          if (product != null) {
            console.log(product.id)
            let minCount = rows[0].Count;
            let maxCount = rows[0].Count;
    
            let minLikes = rows[0].Likes;
            let maxLikes = rows[0].Likes;
    
            let minComm = rows[0].Comments;
            let maxComm = rows[0].Comments;
    
            let minViews = rows[0].Views;
            let maxViews = rows[0].Views;
    
            let minRatings = rows[0].Ratings;
            let maxRatings = rows[0].Ratings;
    
            for (let i = 1, len = rows.length; i < len; i++) {
              const v = rows[i].Count;
              const o = rows[i].Likes;
              const k = rows[i].Comments;
              const q = rows[i].Views;
              const r = rows[i].Ratings;
    
              minCount = (v < minCount) ? v : minCount;
              maxCount = (v > maxCount) ? v : maxCount;
    
              minLikes = (o < minLikes) ? o : minLikes;
              maxLikes = (o > maxLikes) ? o : maxLikes;
    
              minComm = (k < minComm) ? k : minComm;
              maxComm = (k > maxComm) ? k : maxComm;
    
              minViews = (q < minViews) ? q : minViews;
              maxViews = (q > maxLikes) ? q : maxViews;
    
              minRatings = (r < minRatings) ? r : minRatings;
              maxRatings = (r > maxRatings) ? r : maxRatings;
            }
    
            const equation = Math.round(((2.5 * ((row.Likes - minLikes) / (maxLikes - minLikes)))
              + (0.5 * ((row.Views - minViews) / (maxViews - minViews)))
              + (3.5 * ((row.Comments - minComm) / (maxComm - minComm)))
              + (1.5 * ((row.Ratings - minRatings) / (maxRatings - minRatings)))
              + (2 * ((row.Count - minCount) / (maxCount - minCount)))) * 1000) / 1000
            console.log(equation)
    
            try {
              await this.productPopRepository
                .create({
    
                  productId: product.id,
                  popularity: equation,
                  count: row.Count,
                  views: row.Views,
                  minViews: row.Min_Views,
                  maxViews: row.Max_Views,
                  likes: row.Likes,
                  minLikes: row.Min_Likes,
                  maxLikes: row.Max_Likes,
                  comments: row.Comments,
                  minComments: row.Min_Comments,
                  maxComments: row.Max_Comments,
                  ratings: Math.round(row.Ratings * 1000) / 1000
    
                }).then(async newPop => {
                  console.log(
                    'New ',
                    newPop.id,
                  );
                });
            } catch (e) {
              console.log(e)
            }
          }
          else {
            badNames.push(row.camera_name)
          }
          console.log(badNames)
        });
    
    
        //lens
        rows2.forEach(async row => {
    
          const product = await this.productRepository.findOne(
            {
              where: { name: row.lens_name },
            },
          );
    
          if (product != null) {
            console.log(product.id)
            let minCount = rows2[0].Count;
            let maxCount = rows2[0].Count;
    
            let minLikes = rows2[0].Likes;
            let maxLikes = rows2[0].Likes;
    
            let minComm = rows2[0].Comments;
            let maxComm = rows2[0].Comments;
    
            let minViews = rows2[0].Views;
            let maxViews = rows2[0].Views;
    
            let minRatings = rows2[0].Ratings;
            let maxRatings = rows2[0].Ratings;
    
            for (let i = 1, len = rows2.length; i < len; i++) {
              const v = rows2[i].Count;
              const o = rows2[i].Likes;
              const k = rows2[i].Comments;
              const q = rows2[i].Views;
              const r = rows2[i].Ratings;
    
              minCount = (v < minCount) ? v : minCount;
              maxCount = (v > maxCount) ? v : maxCount;
    
              minLikes = (o < minLikes) ? o : minLikes;
              maxLikes = (o > maxLikes) ? o : maxLikes;
    
              minComm = (k < minComm) ? k : minComm;
              maxComm = (k > maxComm) ? k : maxComm;
    
              minViews = (q < minViews) ? q : minViews;
              maxViews = (q > maxLikes) ? q : maxViews;
    
              minRatings = (r < minRatings) ? r : minRatings;
              maxRatings = (r > maxRatings) ? r : maxRatings;
            }
            console.log(minCount)
            console.log(maxCount)
    
    
            const equation = Math.round(((2.5 * ((row.Likes - minLikes) / (maxLikes - minLikes)))
              + (0.5 * ((row.Views - minViews) / (maxViews - minViews)))
              + (3.5 * ((row.Comments - minComm) / (maxComm - minComm)))
              + (1.5 * ((row.Ratings - minRatings) / (maxRatings - minRatings)))
              + (2 * ((row.Count - minCount) / (maxCount - minCount)))) * 1000) / 1000
            console.log(equation)
    
            await this.productPopRepository
              .create({
                productId: product.id,
                popularity: equation,
                count: row.Count,
                views: row.Views,
                minViews: row.Min_Views,
                maxViews: row.Max_Views,
                likes: row.Likes,
                minLikes: row.Min_Likes,
                maxLikes: row.Max_Likes,
                comments: row.Comments,
                minComments: row.Min_Comments,
                maxComments: row.Max_Comments,
                ratings: Math.round(row.Ratings * 1000) / 1000
              })
    
          }
          else {
            badNames2.push(row.camera_name)
          }
          console.log(badNames2)
        });
    */
    // const products = await this.productRepository.findAll({
    // });
    // const categories = await this.categoryRepository.findAll({
    // });
    // const brands = await this.brandRepository.findAll({
    // });
    // const inventory = await this.InventoryRepo.findAll({
    // });
    // const user = await this.userRepo.findAll({
    // });
    // const bin = await this.binRepo.findAll({
    // });
    // const warehouse = await this.werahouseRepo.findAll({
    // });

    // const productValues = await this.productValueRepository.findAll({
    // });

    // const popularity = await this.productPopRepository.findAll({
    // });

    // const view = await this.viewRepo.findAll({
    // });

    // const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    // client.connect(async err => {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     console.log("Successfully Connected!");
    //   }
    //   const collectionUsers = client.db("parachut").collection("users");
    //   const collectionInventories = client.db("parachut").collection("inventories");
    //   const collectionProducts = client.db("parachut").collection("products");
    //   const collectionBrands = client.db("parachut").collection("brands");
    //   const collectionCategories = client.db("parachut").collection("categories");
    //   const collectionBins = client.db("parachut").collection("bins");
    //   const collectionWarehouse = client.db("parachut").collection("warehouse");
    //   const collectionValues = client.db("parachut").collection("productValues");
    //   const collectionPopularity = client.db("parachut").collection("productPopularity");
    //   const collectionView = client.db("parachut").collection("productView");
    //   ///UPDATE NAME OF THE FIELD

    //   collectionProducts.aggregate([
    //     {
    //       $searchBeta: {
    //         "index": "Product",
    //         "search": {
    //           "query": "Canon EOS 100D",
    //           "path": ["name", "aliases"]
    //         }

    //       }
    //     },
    //     {
    //       $limit: 5
    //     },
    //     {
    //       $project: {
    //         "aliases": 1,
    //         "name": 1,
    //         "_id": 0,
    //         score: { $meta: "searchScore" }

    //       }
    //     }
    //   ]
    //   ).toArray(function (err, res) {
    //     if (err) throw err;
    //     console.log(JSON.stringify(res));
    //   })

    // collectionBins.updateMany({}, { $unset: { "id": "" } })

    // collectionProducts.find().toArray(async (err, items) => {
    //   console.log(items.length)
    //   for (let j = 0; j < items.length; j++) {
    //     console.log(j)

    //     collectionView.updateMany({ product: items[j].id }, { $set: { product: items[j]._id } }, function (err, res) {
    //       if (err) throw err;
    //       console.log(res.result.nModified + " document(s) updated");
    //     });

    //     collectionPopularity.updateMany({ product: items[j].id }, { $set: { product: items[j]._id } }, function (err, res) {
    //       if (err) throw err;
    //       console.log(res.result.nModified + " document(s) updated");
    //     });

    //     collectionValues.updateMany({ product: items[j].id }, { $set: { product: items[j]._id } }, function (err, res) {
    //       if (err) throw err;
    //       console.log(res.result.nModified + " document(s) updated");
    //     });

    //     collectionInventories.updateMany({ product: items[j].id }, { $set: { product: items[j]._id } }, function (err, res) {
    //       if (err) throw err;
    //       console.log(res.result.nModified + " document(s) updated");
    //     });

    //   }
    // })

    // collectionCategories.find().toArray(async (err, items) => {
    //   console.log(items.length)
    //   for (let j = 0; j < items.length; j++) {
    //     console.log(j)
    //     collectionCategories.updateMany({ parent: items[j].id }, { $set: { parent: items[j]._id } }, function (err, res) {
    //       if (err) throw err;
    //       console.log(res.result.nModified + " document(s) updated");

    //     });
    //   }
    // })

    // collectionCategories.find().toArray(async (err, items) => {
    //   console.log(items.length)
    //   for (let j = 0; j < items.length; j++) {
    //     console.log(j)
    //     collectionProducts.updateMany({ category: items[j].id }, { $set: { category: items[j]._id } }, function (err, res) {
    //       if (err) throw err;
    //       console.log(res.result.nModified + " document(s) updated");

    //     });
    //   }
    // })

    // collectionBrands.find().toArray(async (err, items) => {
    //   console.log(items.length)
    //   for (let j = 0; j < items.length; j++) {
    //     console.log(j)
    //     collectionProducts.updateMany({ brand: items[j].id }, { $set: { brand: items[j]._id } }, function (err, res) {
    //       if (err) throw err;
    //       console.log(res.result.nModified + " document(s) updated");

    //     });
    //   }
    // })


    // collectionWarehouse.find().toArray(async (err, items) => {
    //   console.log(items.length)
    //   for (let j = 0; j < items.length; j++) {
    //     console.log(j)
    //     collectionInventories.updateMany({ warehouse: items[j].id }, { $set: { warehouse: items[j]._id } }, function (err, res) {
    //       if (err) throw err;
    //       console.log(res.result.nModified + " document(s) updated");

    //     });
    //   }
    // })

    //  collectionBins.find().toArray(async (err, items) => {
    //       console.log(items.length)
    //       for (let j = 0; j < items.length; j++) {
    //         console.log(j)
    //         collectionInventories.updateMany({ bin: items[j].id }, { $set: { bin: items[j]._id } }, function (err, res) {
    //           if (err) throw err;
    //           console.log(res.result.nModified + " document(s) updated");

    //         });
    //       }
    //  })

    // collectionUsers.find().toArray(async (err, items) => {
    //   console.log(items.length)
    //   for (let j = 0; j < items.length; j++) {
    //     console.log(j)
    //     collectionInventories.updateMany({ user: items[j].id }, { $set: { user: items[j]._id } }, function (err, res) {
    //       if (err) throw err;
    //       console.log(res.result.nModified + " document(s) updated");

    //     });
    //     collectionInventories.updateMany({ member: items[j].id }, { $set: { member: items[j]._id } }, function (err, res) {
    //       if (err) throw err;
    //       console.log(res.result.nModified + " document(s) updated");

    //     });
    //     collectionView.updateMany({ user: items[j].id }, { $set: { user: items[j]._id } }, function (err, res) {
    //       if (err) throw err;
    //       console.log(res.result.nModified + " document(s) updated");

    //     });
    //   }
    // })


    // console.log(warehouse[0].id)



    // for (let j = 0; j < view.length; j++) {

    //   const productMDB =
    //   {
    //     _id: new ObjectID(),
    //     ipAddress: view[j].ipAddress,
    //     user: view[j].userId,
    //     product: view[j].productId,
    //     createdAt: view[j].createdAt,
    //     updatedAt: view[j].updatedAt,

    //   }
    //   collectionView.insertOne(productMDB)
    //   console.log(j)
    //   console.log(productMDB._id)
    // }

    // for (let j = 0; j < popularity.length; j++) {

    //   const productMDB =
    //   {
    //     _id: new ObjectID(),
    //     popularity: popularity[j].popularity,
    //     views: popularity[j].views,
    //     count: popularity[j].count,
    //     comments: popularity[j].comments,
    //     ratings: popularity[j].ratings,
    //     product: popularity[j].productId,
    //     likes: popularity[j].likes,
    //     minLikes: popularity[j].minLikes,
    //     maxLikes: popularity[j].maxLikes,
    //     minViews: popularity[j].minViews,
    //     maxViews: popularity[j].maxViews,
    //     minComments: popularity[j].minComments,
    //     maxComments: popularity[j].maxComments,
    //     createdAt: popularity[j].createdAt,
    //     updatedAt: popularity[j].updatedAt,

    //   }
    //   collectionPopularity.insertOne(productMDB)
    //   console.log(j)
    //   console.log(productMDB._id)
    // }

    // for (let j = 0; j < productValues.length; j++) {

    //   const productMDB =
    //   {
    //     _id: new ObjectID(),
    //     id: productValues[j].id,
    //     value: productValues[j].value,
    //     product: productValues[j].productId,
    //     condition: productValues[j].condition,
    //     source: productValues[j].source,
    //     mfr: productValues[j].mfr,
    //     kehName: productValues[j].kehName,
    //     mpbName: productValues[j].mpbName,
    //     lensAuthName: productValues[j].lensAuthName,
    //     photoProName: productValues[j].photoProName,
    //     createdAt: productValues[j].createdAt,
    //     updatedAt: productValues[j].updatedAt,

    //   }
    //   collectionValues.insertOne(productMDB)
    //   console.log(j)
    //   console.log(productMDB.id)
    // }

    // for (let j = 0; j < warehouse.length; j++) {

    //   const productMDB =
    //   {
    //     _id: new ObjectID(),
    //     id: warehouse[j].id,
    //     city: warehouse[j].city,
    //     country: warehouse[j].country,
    //     easyPostId: warehouse[j].easyPostId,
    //     email: warehouse[j].email,
    //     phone: warehouse[j].phone,
    //     name: warehouse[j].name,
    //     primary: warehouse[j].primary,
    //     residential: warehouse[j].residential,
    //     state: warehouse[j].state,
    //     street1: warehouse[j].street1,
    //     street2: warehouse[j].street2,
    //     coordinates: warehouse[j].coordinates,
    //     zip: warehouse[j].zip,
    //     userId: warehouse[j].userId,
    //     createdAt: warehouse[j].createdAt,
    //     updatedAt: warehouse[j].updatedAt,
    //     deletedAt: warehouse[j].deletedAt
    //   }
    //   collectionWarehouse.insertOne(productMDB)
    //   console.log(j)
    //   console.log(productMDB.id)
    // }

    // for (let j = 0; j < bin.length; j++) {

    //   const productMDB =
    //   {
    //     _id: new ObjectID(),
    //     id: bin[j].id,
    //     cell: bin[j].cell,
    //     column: bin[j].column,
    //     row: bin[j].row,
    //     location: bin[j].location,
    //     width: bin[j].width,
    //     height: bin[j].height,
    //     createdAt: bin[j].createdAt,
    //     updatedAt: bin[j].updatedAt
    //   }
    //   collectionBins.insertOne(productMDB)
    //   console.log(j)
    //   console.log(productMDB.id)
    // }

    // for (let j = 0; j < products.length; j++) {

    //   const productMDB =
    //   {
    //     id: products[j].id,
    //     active: products[j].active,
    //     length: products[j].length,
    //     description: products[j].description,
    //     features: products[j].features,
    //     height: products[j].height,
    //     images: products[j].images,
    //     inTheBox: products[j].inTheBox,
    //     estimatedEarnings: products[j].estimatedEarnings,
    //     lastInventoryCreated: products[j].lastInventoryCreated,
    //     mfr: products[j].mfr,
    //     name: products[j].name,
    //     elasticId: products[j].elasticId,
    //     points: products[j].points,
    //     popularity: products[j].popularity,
    //     shippingWeight: products[j].shippingWeight,
    //     slug: products[j].slug,
    //     aliases: products[j].aliases,
    //     stock: products[j].stock,
    //     demand: products[j].demand,
    //     weight: products[j].weight,
    //     width: products[j].width,
    //     releaseDate: products[j].releaseDate,
    //     brand: products[j].brandId,
    //     category: products[j].categoryId,
    //     createdAt: products[j].createdAt,
    //     updatedAt: products[j].updatedAt
    //   }
    //   collectionProducts.insertOne(productMDB)
    //   console.log(j)
    //   console.log(productMDB.id)
    // }

    // for (let j = 0; j < categories.length; j++) {

    //   const productMDB =
    //   {
    //     id: categories[j].id,
    //     logo: categories[j].logo,
    //     name: categories[j].name,
    //     slug: categories[j].slug,
    //     description: categories[j].description,
    //     includedEssentials: categories[j].includedEssentials,
    //     parent: categories[j].parentId,
    //     createdAt: categories[j].createdAt,
    //     updatedAt: categories[j].updatedAt
    //   }
    //   collectionCategories.insertOne(productMDB)
    //   console.log(j)
    //   console.log(productMDB.id)
    // }

    // for (let j = 0; j < brands.length; j++) {

    //   const productMDB =
    //   {
    //     id: brands[j].id,
    //     logo: brands[j].logo,
    //     name: brands[j].name,
    //     slug: brands[j].slug,
    //     url: brands[j].url,
    //     createdAt: brands[j].createdAt,
    //     updatedAt: brands[j].updatedAt
    //   }
    //   collectionBrands.insertOne(productMDB)
    //   console.log(j)
    //   console.log(productMDB.id)
    // }

    // for (let j = 0; j < inventory.length; j++) {

    //   const productMDB =
    //   {
    //     id: inventory[j].id,
    //     active: inventory[j].active,
    //     condition: inventory[j].condition,
    //     hasEssentials: inventory[j].hasEssentials,
    //     markedForReturn: inventory[j].markedForReturn,
    //     images: inventory[j].images,
    //     commission: inventory[j].commission,
    //     missingEssentials: inventory[j].missingEssentials,
    //     serial: inventory[j].serial,
    //     sku: inventory[j].sku,
    //     returnReason: inventory[j].returnReason,
    //     status: inventory[j].status,
    //     bin: inventory[j].binId,
    //     product: inventory[j].productId,
    //     user: inventory[j].userId,
    //     member: inventory[j].memberId,
    //     warehouse: inventory[j].warehouseId,
    //     createdAt: inventory[j].createdAt,
    //     updatedAt: inventory[j].updatedAt
    //   }
    //   collectionInventories.insertOne(productMDB)
    //   console.log(j)
    //   console.log(productMDB.id)
    // }

    // for (let j = 0; j < user.length; j++) {

    //   const productMDB =
    //   {
    //     id: user[j].id,
    //     avatar: user[j].avatar,
    //     bio: user[j].bio,
    //     billingHour: user[j].billingHour,
    //     billingDay: user[j].billingDay,
    //     businessName: user[j].businessName,
    //     contributorStep: user[j].contributorStep,
    //     email: user[j].email,
    //     location: user[j].location,
    //     phone: user[j].phone,
    //     name: user[j].name,
    //     parsedName: user[j].parsedName,
    //     planId: user[j].planId,
    //     points: user[j].points,
    //     affiliate: user[j].affiliate,
    //     roles: user[j].roles,
    //     status: user[j].status,
    //     site: user[j].site,
    //     stripeId: user[j].stripeId,
    //     protectionPlan: user[j].protectionPlan,
    //     legacyPlan: user[j].legacyPlan,
    //     additionalItems: user[j].additionalItems,
    //     vip: user[j].vip,
    //     createdAt: user[j].createdAt,
    //     updatedAt: user[j].updatedAt,
    //     deletedAt: user[j].deletedAt
    //   }
    //   collectionUsers.insertOne(productMDB)
    //   console.log(j)
    //   console.log(productMDB)
    // }

    // client.close();
    // });





    /*
    const categories = await this.categoryRepository.findAll({});
 
    function findBreadCrumbs(cat: Category): Category[] {
      const _categories = [cat];
 
      const getParent = async (child: Category) => {
        if (child.parentId) {
          const parent = categories.find((cate) => cate.id === child.parentId);
 
          if (parent) {
            _categories.push(parent);
 
            if (parent.parentId) {
              getParent(parent);
            }
          }
        }
      };
 
      getParent(cat);
 
      return _categories;
    }
 
    const products = await this.productRepository.findAll({
      include: ['brand', 'category', 'inventory', 'attributesValues'],
    });
 
    console.log(products[0])
 
    const dataset: any = products.map((product) => {
      let cats = null;
      if (product.category) {
        cats = findBreadCrumbs(product.category);
      }
 
      const productr = {
        id: product.id,
        name: product.name,
        mfr: product.mfr,
        camera: cats
          ? !!cats.find((category) => category.name.search('Cameras') !== -1)
          : false,
        lens: cats
          ? !!cats.find((category) => category.name.search('Lenses') !== -1)
          : false,
        category_name: product.category
          ? product.category.name : null,
        category_id: product.category
          ? product.category.id : null,
        category_slug: product.category
          ? product.category.slug : null,
        brand_id: product.brand
          ? product.brand.id : null,
        brand_name: product.brand
          ? product.brand.name : null,
        brand_slug: product.brand
          ? product.brand.slug : null,
        slug: product.slug,
        stock: product.inventory.filter((i) => i.status === 'INWAREHOUSE').length,
        points: product.points,
        images: product.images ? (product.images[0] ? product.images[0] : null) : null,
        popularity: product.popularity,
        demand: product.demand,
        last_inventory_created: product.lastInventoryCreated,
      }
 
 
      let i = 0;
      while (i < cats.length - 1) {
        const newName = cats.length - i - 1
        productr['category' + (newName)] = cats[i].name
        i++;
      }
 
 
      if (productr.name.includes("Kit") === false) {
        //sensor type
        const match = product.attributesValues.find(x => x.productAttributeId === '236f22bf-377e-4db6-8a9f-b30d2c9cf9a7');
        if (match != undefined) { productr['sensor_type'] = match.value }
 
        //camera format
        const match15 = product.attributesValues.find(x => x.productAttributeId.includes('757980dc-ca98-45f5-b52e-6f4d110ac10b'));
        if (match15 != undefined) { productr['format'] = match15.value }
 
        //format comp
        const match16 = product.attributesValues.find(x => x.productAttributeId.includes('8afdc7dc-bbc6-4396-8103-b761447c4a19'));
        if (match16 != undefined) { productr['format'] = match16.value }
 
 
        // format
        const match17 = product.attributesValues.find(x => x.productAttributeId.includes('c3f09410-a723-4b1c-9be8-5ec634ba56cd'));
        if (match17 != undefined) { productr['format'] = match17.value }
 
        //sensor size
        const match18 = product.attributesValues.find(x => x.productAttributeId.includes('f2783ba0-1ea8-4b31-843d-b4d7edde3672'));
        if (match18 != undefined) { productr['sensor_size'] = match18.value.replace("\"", " in") }
 
        //Pixels
        const match19 = product.attributesValues.find(x => x.productAttributeId.includes('8a08f6e5-34ed-43a7-a8c2-8563eb3fa797'));
        if (match19 != undefined) {
 
          productr['pixels'] = parseFloat(match19.value.replace("Actual:", "").replace("Effective:", "").replace("Total:", ""))
        }
 
        //effective Pixels
        const match20 = product.attributesValues.find(x => x.productAttributeId.includes('e1d4a4db-1c4c-4f54-889a-d39b9c56dcd5'));
        if (match20 != undefined) {
          if (match20.value.includes("x") === false) {
            if (match20.value.includes("Horizontal:") === false) {
              productr['pixels'] = parseFloat(match20.value.replace("Actual:", "").replace("Effective:", "").replace("Total:", "").replace("(Photo)", "").replace("(approximately)", "").replace("Approximately", "").replace("Approx.", ""))
            }
          }
        }
 
        //lens mount
        const match1 = product.attributesValues.find(x => x.productAttributeId.includes('995a9646-dfff-423a-a1f3-78ff97a0b20a'));
        if (match1 != undefined) { productr['lens_mount'] = match1.value }
 
        //lens type
        const match2 = product.attributesValues.find(x => x.productAttributeId.includes('51bd21c5-ba1a-4fa9-9b98-f2db7936ae0a'));
        if (match2 != undefined) { productr['lens_type'] = match2.value }
 
 
        // //format compatibility
        // const match13 = product.attributesValues.find(x => x.productAttributeId.includes('8afdc7dc-bbc6-4396-8103-b761447c4a19'));
        // if (match13 != undefined) { productr['format_compatibility'] = match13.value }
 
        //focal length
        const match3 = product.attributesValues.find(x => x.productAttributeId.includes('12ce7ea8-6e83-45a0-91e8-01a04b415466'));
        if (match3 != undefined) {
          if (productr.id != '09615de9-f8a3-470f-8931-6364f09ccb22') {
            if (productr.id != '489146db-883d-4699-9c68-f23f108baa05') {
              if (productr.id != '41c88d77-ea5b-4299-adc2-2a7d543f115b') {
                if (productr.id != '3ce26ff5-d3b8-4a76-b1f3-80567f14595c') {
                  if (productr.id != '3ce26ff5-d3b8-4a76-b1f3-80567f14595c') {
                    if (productr.id != 'e8e0fed0-5053-405b-b1b3-ec829cad22ec') {
                      if (productr.id != '8e21d279-79e3-4603-a8f0-3821e950e7c5') {
                        //split for "to" Normal 4:3 or 16:91x: 
                        if (match3.value.replace(/mm/g, '').replace('Comparable 35mm Equivalent on APS-C Format Focal Length: 89.6mm', '').replace('Comparable 35mm Equivalent on APS-C Format Focal Length: 84mm', '').includes("to")) {
 
                          const newFocalLength = match3.value.replace(/mm/g, '').replace(/\n/g, '').replace('Standard: ', '').split('to')
 
                          productr['focal_length_low'] = parseFloat(newFocalLength[0].trim().replace('(1x)', '').replace('Normal 4:3 or 16:91x:', ''))
                          //split on extender 
                          if (newFocalLength[1].trim().includes('With Extender:') === true) {
 
 
                            const newHighFocal = newFocalLength[1].trim().split('With Extender:')
                            productr['focal_length_high'] = parseFloat(newHighFocal[0].trim())
                          }
                          else if (newFocalLength[1].trim().includes('(') === true) {
                            const newHighFocal = newFocalLength[1].trim().split('(')
                            productr['focal_length_high'] = parseFloat(newHighFocal[0].trim())
                          }
                          else {
                            productr['focal_length_high'] = parseFloat(newFocalLength[1].trim())
                          }
                        }
                        else if (match3.value.replace(/mm/g, '').includes("-")) {
                          const newFocalLength = match3.value.replace(/mm/g, '').replace(/\n/g, '').split('-')
 
                          productr['focal_length_low'] = parseFloat(newFocalLength[0].trim().replace('(1x)', ''))
                          //split on extender 
                          if (newFocalLength[1].trim().includes('With Extender:') === true) {
 
 
                            const newHighFocal = newFocalLength[1].trim().split('With Extender:')
                            productr['focal_length_high'] = parseFloat(newHighFocal[0].trim())
                          }
                          else if (newFocalLength[1].trim().includes('(') === true) {
                            const newHighFocal = newFocalLength[1].trim().split('(')
                            productr['focal_length_high'] = parseFloat(newHighFocal[0].trim())
                          }
                          else {
                            productr['focal_length_high'] = parseFloat(newFocalLength[1].trim())
                          }
                        }
                        else {
 
                          if (match3.value.replace(/mm/g, '').includes("(") === true) {
                            const newFocal = match3.value.replace(/mm/g, '').split('(')
                            productr['focal_length_low'] = parseFloat(newFocal[0].trim())
                            productr['focal_length_high'] = parseFloat(newFocal[0].trim())
                          } else {
                            productr['focal_length_low'] = parseFloat(match3.value.replace(/mm/g, ''))
                            productr['focal_length_high'] = parseFloat(match3.value.replace(/mm/g, ''))
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
 
        }
 
        //focal range
        const match9 = product.attributesValues.find(x => x.productAttributeId.includes('c6ef0531-5bbd-42a2-b480-e3530ed2f7f0'));
        if (match9 != undefined) {
          if (productr.id != '09615de9-f8a3-470f-8931-6364f09ccb22') {
            if (productr.id != '489146db-883d-4699-9c68-f23f108baa05') {
              if (productr.id != '41c88d77-ea5b-4299-adc2-2a7d543f115b') {
                if (productr.id != '3ce26ff5-d3b8-4a76-b1f3-80567f14595c') {
                  if (productr.id != '3ce26ff5-d3b8-4a76-b1f3-80567f14595c') {
                    if (productr.id != 'e8e0fed0-5053-405b-b1b3-ec829cad22ec') {
                      if (productr.id != '8e21d279-79e3-4603-a8f0-3821e950e7c5') {
                        //split for "to" Normal 4:3 or 16:91x: 
                        if (match9.value.replace(/mm/g, '').includes("to")) {
 
                          const newFocalLength = match9.value.replace(/mm/g, '').replace(/\n/g, '').replace('Standard: ', '').split('to')
 
                          productr['focal_length_low'] = parseFloat(newFocalLength[0].replace(',', '').trim())
                          productr['focal_length_high'] = parseFloat(newFocalLength[1].replace(',', '').trim())
 
                        }
                        else if (match9.value.replace(/mm/g, '').includes("-")) {
                          const newFocalLength = match9.value.replace(/mm/g, '').replace(/\n/g, '').split('-')
 
                          productr['focal_length_low'] = parseFloat(newFocalLength[0].replace(',', '').trim())
                          productr['focal_length_high'] = parseFloat(newFocalLength[1].replace(',', '').trim())
 
                        }
 
                      }
                    }
                  }
                }
              }
            }
          }
 
        }
 
        //focal range two
        const match10 = product.attributesValues.find(x => x.productAttributeId.includes('90b50bf3-b81f-4979-a383-29da616d5063'));
        if (match10 != undefined) {
          if (productr.id != '09615de9-f8a3-470f-8931-6364f09ccb22') {
            if (productr.id != '489146db-883d-4699-9c68-f23f108baa05') {
              if (productr.id != '41c88d77-ea5b-4299-adc2-2a7d543f115b') {
                if (productr.id != '3ce26ff5-d3b8-4a76-b1f3-80567f14595c') {
                  if (productr.id != '3ce26ff5-d3b8-4a76-b1f3-80567f14595c') {
                    if (productr.id != 'e8e0fed0-5053-405b-b1b3-ec829cad22ec') {
                      if (productr.id != '8e21d279-79e3-4603-a8f0-3821e950e7c5') {
                        //split for "to" Normal 4:3 or 16:91x: 
                        if (match10.value.replace(/mm/g, '').includes("to")) {
 
                          const newFocalLength = match10.value.replace(/mm/g, '').replace(/\n/g, '').replace('Standard: ', '').split('to')
 
                          productr['focal_length_low'] = parseFloat(newFocalLength[0].replace(',', '').trim())
                          productr['focal_length_high'] = parseFloat(newFocalLength[1].replace(',', '').trim())
 
                        }
                        else if (match10.value.replace(/mm/g, '').includes("-")) {
                          const newFocalLength = match10.value.replace(/mm/g, '').replace(/\n/g, '').split('-')
 
                          productr['focal_length_low'] = parseFloat(newFocalLength[0].replace(',', '').trim())
                          productr['focal_length_high'] = parseFloat(newFocalLength[1].replace(',', '').trim())
 
                        }
 
                      }
                    }
                  }
                }
              }
            }
          }
 
        }
 
        //lens focal length
        const match11 = product.attributesValues.find(x => x.productAttributeId.includes('a67428c4-76b6-468e-85f1-00afef77eca8'));
        if (match11 != undefined) {
 
          //split for "to" Normal 4:3 or 16:91x: 
          if (match11.value.replace(/mm/g, '').includes("to")) {
 
            const newFocalLength = match11.value.replace(/mm/g, '').replace(/\n/g, '').replace('Standard: ', '').split('to')
 
            productr['focal_length_low'] = parseFloat(newFocalLength[0].replace(',', '').trim())
            productr['focal_length_high'] = parseFloat(newFocalLength[1].replace(',', '').trim())
 
          }
          else if (match11.value.replace(/mm/g, '').includes("-")) {
            const newFocalLength = match11.value.replace(/mm/g, '').replace(/\n/g, '').split('-')
 
            productr['focal_length_low'] = parseFloat(newFocalLength[0].replace(',', '').trim())
            productr['focal_length_high'] = parseFloat(newFocalLength[1].replace(',', '').trim())
 
          }
          else {
            productr['focal_length_low'] = parseFloat(match11.value.replace(',', '').trim())
            productr['focal_length_high'] = parseFloat(match11.value.replace(',', '').trim())
 
          }
 
 
 
        }
 
        //focal distance
        const match12 = product.attributesValues.find(x => x.productAttributeId.includes('958e7fb0-ca87-4c06-a00e-a6f63a99dc69'));
        if (match12 != undefined) {
 
          //split for "to" Normal 4:3 or 16:91x: 
          if (match12.value.replace(/mm/g, '').includes("to")) {
 
            const newFocalLength = match12.value.replace(/mm/g, '').replace(/\n/g, '').replace('Standard: ', '').split('to')
 
            productr['focal_length_low'] = parseFloat(newFocalLength[0].replace(',', '').trim())
            productr['focal_length_high'] = parseFloat(newFocalLength[1].replace(',', '').trim())
 
          }
          else if (match12.value.replace(/mm/g, '').includes("-")) {
            const newFocalLength = match12.value.replace(/mm/g, '').replace(/\n/g, '').split('-')
 
            productr['focal_length_low'] = parseFloat(newFocalLength[0].replace(',', '').trim())
            productr['focal_length_high'] = parseFloat(newFocalLength[1].replace(',', '').trim())
 
          }
          else {
            productr['focal_length_low'] = parseFloat(match12.value.replace(',', '').trim())
            productr['focal_length_high'] = parseFloat(match12.value.replace(',', '').trim())
 
          }
 
 
 
        }
 
 
        let low
        let high
        //min aperture
        const match5 = product.attributesValues.find(x => x.productAttributeId.includes('974ff567-f92f-4426-b9ed-3b2753ca4b16'));
        if (match5 != undefined) {
          const apertureOriginal = match5.value.replace(/f/g, "").replace(/\//g, "")
          if (apertureOriginal.includes('to')) {
            const newApert = apertureOriginal.split('to')
 
            high = parseFloat(newApert[1])
            low = parseFloat(newApert[0])
            productr['aperture_min'] = parseFloat(newApert[0])
            productr['aperture_max'] = parseFloat(newApert[1])
 
          }
          else if (apertureOriginal.includes('Not Speciied by Manuacturer')) {
 
          }
          else {
            productr['aperture_min'] = parseFloat(apertureOriginal)
          }
 
        }
 
        //max aperture
        const match6 = product.attributesValues.find(x => x.productAttributeId.includes('52c625c1-3140-452c-a4b1-66136e6cd89f'));
        if (match6 != undefined) {
          const apertureOriginal = match6.value.replace(/f/g, "").replace(/\//g, "").replace(/=/g, "").replace(/T/g, "")
          if (apertureOriginal.includes('to')) {
            const newApert = apertureOriginal.split('to')
 
            if (high != undefined) {
              if (high < newApert[1]) {
                productr['aperture_max'] = parseFloat(newApert[1])
              }
              if (low > newApert[1]) {
                productr['aperture_min'] = parseFloat(newApert[1])
              }
            }
            else {
              productr['aperture_min'] = parseFloat(newApert[0])
              productr['aperture_max'] = parseFloat(newApert[1])
            }
 
          }
          else if (apertureOriginal.includes('Not Speciied by Manuacturer')) {
 
          }
          else if (apertureOriginal.includes('Not Specified by Manufacturer')) {
 
          }
          else {
            productr['aperture_min'] = parseFloat(apertureOriginal)
            productr['aperture_max'] = parseFloat(apertureOriginal)
          }
 
        }
 
        //range aperture
        const match8 = product.attributesValues.find(x => x.productAttributeId.includes('0dbe207c-9cf1-42a5-8ef4-ad1c615696b2'));
        if (match8 != undefined) {
          const apertureOriginal = match8.value.replace(/f/g, "").replace(/\//g, "").replace(/=/g, "").replace(/T/g, "")
          if (apertureOriginal.includes('to')) {
            const newApert = apertureOriginal.split('to')
 
 
            productr['aperture_min'] = parseFloat(newApert[0])
            productr['aperture_max'] = parseFloat(newApert[1])
 
 
          }
          else if (apertureOriginal.includes('Not Speciied by Manuacturer')) {
 
          }
          else if (apertureOriginal.includes('Not Specified by Manufacturer')) {
 
          }
          else if (apertureOriginal.includes('-')) {
            const newApert = apertureOriginal.split('-')
 
 
            productr['aperture_min'] = parseFloat(newApert[0])
            productr['aperture_max'] = parseFloat(newApert[1])
          }
 
        }
 
        //effective aperture 
        const match7 = product.attributesValues.find(x => x.productAttributeId.includes('629f5700-a9bd-4912-8496-c4c4255062ea'));
        if (match7 != undefined) {
          const apertureOriginal = match7.value.replace(/f/g, "").replace(/\//g, "").replace(/=/g, "").replace(/T/g, "")
          if (apertureOriginal.includes('to')) {
            const newApert = apertureOriginal.split('to')
 
            // if (high != undefined) {
            //   if (high < newApert[1]) {
            //     productr['aperture_max'] = parseFloat(newApert[1])
            //   }
            //   if (low > newApert[1]) {
            //     productr['aperture_min'] = parseFloat(newApert[1])
            //   }
            // }
            // else {
            //   productr['aperture_min'] = parseFloat(newApert[0])
            //   productr['aperture_max'] = parseFloat(newApert[1])
            // }
 
          }
          else if (apertureOriginal.includes('Not Speciied by Manuacturer')) {
 
          }
          else if (apertureOriginal.includes('Not Specified by Manufacturer')) {
 
          }
          else {
            productr['aperture_min'] = parseFloat(apertureOriginal)
            productr['aperture_max'] = parseFloat(apertureOriginal)
          }
 
        }
 
        //aperture
        const match4 = product.attributesValues.find(x => x.productAttributeId.includes('62f2e3b5-0959-42df-9062-7ef475d53949'));
        if (match4 != undefined) {
 
          if (productr.id != 'be0c8936-763d-4de8-b614-d4639a594d5e') {
            if (productr.id != 'e580a452-545e-40c3-b970-41db0ab763f2') {
              const apertureOriginal = match4.value.replace(/f/g, "").replace(/F/g, "").replace(/\//g, "").replace(/T/g, "").replace("Maximum:", "").replace("Minimum:", "").replace("Min:", "").replace("Max:", "").trim()
              if (apertureOriginal.includes('to')) {
                const newApert = apertureOriginal.split('to')
 
                productr['aperture_min'] = parseFloat(newApert[0])
                productr['aperture_max'] = parseFloat(newApert[1])
 
              }
              else if (apertureOriginal.includes('\n')) {
                const newApert = apertureOriginal.split('\n')
 
                productr['aperture_min'] = parseFloat(newApert[0])
                productr['aperture_max'] = parseFloat(newApert[1])
              }
              else if (apertureOriginal.includes('-')) {
                const newApert = apertureOriginal.split('-')
 
                productr['aperture_min'] = parseFloat(newApert[0])
                productr['aperture_max'] = parseFloat(newApert[1])
              }
              else if (apertureOriginal.includes('Not Speciied by Manuacturer')) {
 
              }
              else if (apertureOriginal.includes('Not Specified by Manufacturer')) {
 
              }
              else {
                productr['aperture_min'] = parseFloat(apertureOriginal)
                productr['aperture_max'] = parseFloat(apertureOriginal)
              }
            }
          }
        }
 
      }
 
 
 
      return productr;
    })
    console.log(dataset[0])
 
 
    let ii = 0;
 
    //dataset.length
    while (ii < dataset.length) {
      const smallSet = dataset.slice(ii, ii + 4999);
 
      if (smallSet.length) {
 
        fs.writeFile(
          `./products${ii}.json`,
          JSON.stringify(smallSet, null, 2),
          err =>
            err ? console.error("Data not written", err) : console.log("Data written")
        );
 
      }
 
 
      ii = ii + 4999
    }
 
*/
    // const productsValues = await this.productValueRepository.findAll({});


    // for (let i = 0; i < productsValues.length; i++) {

    //   const products = await this.productRepository.findOne({
    //     where: { id: productsValues[i].productId },
    //   });
    //   console.log(products.mfr)

    //   await this.productValueRepository
    //     .update(
    //       {
    //         mfr: products.mfr,

    //       },
    //       { where: { product_id: productsValues[i].productId } }
    //     )
    // }





    const categories = await this.categoryRepository.findAll({});

    function findBreadCrumbs(cat: Category): Category[] {
      const _categories = [cat];

      const getParent = async (child: Category) => {
        if (child.parentId) {
          const parent = categories.find((cate) => cate.id === child.parentId);

          if (parent) {
            _categories.push(parent);

            if (parent.parentId) {
              getParent(parent);
            }
          }
        }
      };

      getParent(cat);

      return _categories;
    }

    const elasti = new Client({
      node:
        'http://localhost:9200',
    });

    const products = await this.productRepository.findAll({
      include: ['brand', 'category', 'inventory'],
    });

    await elasti.indices.create(
      {
        index: 'products_crawl',
        body: {
          mappings: {
            properties: {
              id: { type: 'text' },
              name: { type: 'search_as_you_type' },
              mfr: { type: 'test' },
              aliases: { type: 'search_as_you_type' },
              brand: {
                type: 'object',
                properties: {
                  name: { type: 'text' },
                  id: { type: 'text' },
                  slug: { type: 'text' },
                },
              },
              category: {
                type: 'object',
                properties: {
                  name: { type: 'text' },
                  id: { type: 'text' },
                  slug: { type: 'text' },
                },
              },
              camera: { type: 'boolean' },
              lens: { type: 'boolean' },
            },
          },
        },
      },
      { ignore: [400] },
    );

    const dataset: any = products.map((product) => {
      let cats = null;
      if (product.category) {
        cats = findBreadCrumbs(product.category);
      }

      return {
        id: product.id,
        name: product.name,
        mfr: product.mfr,
        camera: cats
          ? !!cats.find((category) => category.name.search('Cameras') !== -1)
          : false,
        lens: cats
          ? !!cats.find((category) => category.name.search('Lenses') !== -1)
          : false,
        category: product.category
          ? {
            name: product.category.name,
            id: product.category.id,
            slug: product.category.slug,
          }
          : null,
        brand: product.brand
          ? {
            name: product.brand.name,
            id: product.brand.id,
            slug: product.brand.slug,
          }
          : null,
        aliases: product.aliases
          ? product.aliases.split(',').map((a) => a.trim())
          : null,
      };
    });

    const body = dataset.flatMap((doc) => [
      { index: { _index: 'products_crawl' } },
      doc,
    ]);

    const { body: bulkResponse } = await elasti.bulk({ body })

    if (bulkResponse.errors) {
      const erroredDocuments = [];
      // The items array has the same order of the dataset we just indexed.
      // The presence of the `error` key indicates that the operation
      // that we did for the document has failed.
      bulkResponse.items.forEach((action, i) => {
        const operation = Object.keys(action)[0];
        if (action[operation].error) {
          erroredDocuments.push({
            // If the status is 429 it means that you can retry the document,
            // otherwise it's very likely a mapping error, and you should
            // fix the document before to try it again.
            status: action[operation].status,
            error: action[operation].error,
            operation: body[i * 2],
            document: body[i * 2 + 1],
          });
        }
      });
      console.log(erroredDocuments);
    }

    const { body: count } = await elasti.count({ index: 'products_crawl' });
    console.log(count);

    return

  }



}