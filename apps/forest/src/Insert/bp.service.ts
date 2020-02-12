import { Injectable, Inject, Logger, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { Product, Category, Brand, ProductAttribute, ProductAttributeValue } from '@app/database/entities';
import * as puppeteer from 'puppeteer'
import *  as uuidv1 from 'uuid'
import { errors } from '@elastic/elasticsearch';
import e = require('express');




@Injectable()
export class BPService {
  private logger = new Logger('BPService')

  private readonly productRepository: typeof Product = this.sequelize.getRepository(
    'Product',
  );
  private readonly brandRepository: typeof Brand = this.sequelize.getRepository(
    'Brand',
  );

  private readonly categoryRepository: typeof Category = this.sequelize.getRepository(
    'Category',
  );

  private readonly productAttributeRepository: typeof ProductAttribute = this.sequelize.getRepository(
    'ProductAttribute',
  );
  private readonly productAttributeValueRepository: typeof ProductAttributeValue = this.sequelize.getRepository(
    'ProductAttributeValue',
  );


  constructor(@Inject('SEQUELIZE') private readonly sequelize) { }

  async insertItem(body): Promise<Product[]> {

    let newItem = {};
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(
        body.url,
        {
          waitUntil: "networkidle2",
          timeout: 120000
        }
      );
      await page.addScriptTag({
        url: "https://code.jquery.com/jquery-3.2.1.min.js"
      });


      //////////////------------------------------------------------ START GENERAL-----------------------------------
      const data = await page.evaluate(() => {
        //CAMERA
        const cameraString = $('h1[class^="title"]').first().text();
        let name = "";
        if (!cameraString) {
          name
        } else {
          name = cameraString
            .replace(" Body", "")
            .replace(" (Body Only, ", " (")
            .replace(", Body Only), ", ")")
            .replace(" (Body Only)", "")
            .replace(" DSLR", "")
            .replace(" SLR", "")
            .replace(" Camera", "")
            .replace(" Digital", "")
            .replace(" Mirrorless", "")
            .replace(" Rangefinder", "")
            .replace(" Micro Four Thirds", "")
            .replace(" Format", "")
            .replace(" Medium", "")
            .replace(" Point-and-Shoot", "")
            .replace(" (Camera Body)", "")
            .replace(" Lens", "")
            .trim();
        }
        const slug = name
          .toLocaleLowerCase()
          .replace(/\+ /g, "")
          .replace(/\"/g, "")
          .replace(/\//g, "-")
          .replace(/\,/g, "")
          .replace(/\./g, "-")
          .replace(/\ -/g, "")
          .replace(/\:/g, "-")
          .replace(/\(/g, "")
          .replace(/\)/g, "")
          .replace(/\& /g, "")
          .replace(/\ /g, "-")
          .replace(/\---/g, "-")
          .replace(/\--/g, "-");

        //CAMERA PRICE/POINTS
        const cameraPriceSearch = $('*[data-selenium^="pricingPrice"]').first().text();
        let points = 0;
        if (!cameraPriceSearch) {
          points
        } else {
          points = Math.ceil(parseInt(cameraPriceSearch.replace("$", "").replace(",", "")));
        }

        //IMG SRC
        const imgSrcString = $('img[class^="image"]').attr("src");
        let images = ''
        if (!imgSrcString) {
          images;
        } else {
          images = imgSrcString;
          if (images === "https://static.bhphoto.com/images/en/na500x500.jpg") {
            images = "";
          } else {
            images = images;
          }
        }

        //IMG SRC LOGO
        const logoSrcString = $(
          '*[data-selenium^="authorizedDealerLink"] img'
        )
        let logo = ''
        if (!logoSrcString) {
          logo = "";
        } else {
          logo = logoSrcString.attr("src");
        }

        //IMG ID
        let imageId = '';
        if (imgSrcString === '') {
          imageId = "";
        }

        //BRAND NAME
        const brandSrcString = $('*[class^="dealer_"] img').attr("alt");
        let brand = '';
        let brandSlug = ''
        if (!brandSrcString) {
          const brandSrcString1 = $('*[class^="dealer_"] span').html();

          if (!brandSrcString1) {
            brand
          } else {
            brand = brandSrcString1.replace(" <!-- -->", "").replace("<!-- --> ", "");
            brandSlug = brand
              .toLowerCase()
              .replace(/\ &"/g, "")
              .replace("(", "")
              .replace(")", "")
              .replace(/\ /g, "-");
          }
        } else {
          brand = brandSrcString;
          brandSlug = brand
            .toLowerCase()
            .replace(/\ &"/g, "")
            .replace("(", "")
            .replace(")", "")
            .replace(/\ /g, "-")
            .replace(/\--/g, "-")
        }

        //CATEGORY
        const categoryString = $('a[class^="linkCrumb_"]').last().text();
        let category = ''
        let categorySlug = ''
        if (!categoryString) {
          category
        } else {
          category = categoryString;
          categorySlug = category
            .toLowerCase()
            .replace(/\&/g, "")
            .replace("(", "")
            .replace(")", "")
            .replace(/\ -/g, "")
            .replace(/\,/g, "")
            .replace(/\ /g, "-")
            .replace(/\--/g, "-")
        }

        //CATEGORY Parent
        const categoryParentString = $('a[class^="linkCrumb_"]')
          .eq(-2)
          .text();
        let categoryParent = ''
        let categoryParentSlug = ''
        if (!categoryParentString) {
          categoryParent
        } else {
          categoryParent = categoryParentString
          categoryParentSlug = categoryParent
            .toLowerCase()
            .replace(/\ &"/g, "")
            .replace("(", "")
            .replace(")", "")
            .replace(/\ -/g, "")
            .replace(/\,/g, "")
            .replace(/\ /g, "-");
        }

        //CATEGORY GrandParent
        const categoryGrandParentString = $('a[class^="linkCrumb_"]')
          .eq(-3)
          // .prev()
          .text();
        let categoryGrandParent = ''
        let categoryGrandParentSlug = ''
        if (!categoryGrandParentString) {
          categoryGrandParent = "";
        } else {
          categoryGrandParent = categoryGrandParentString;
          categoryGrandParentSlug = categoryGrandParent
            .toLowerCase()
            .replace(/\ &"/g, "")
            .replace("(", "")
            .replace(")", "")
            .replace(/\ -/g, "")
            .replace(/\,/g, "")
            .replace(/\ /g, "-");
        }

        //MFR
        const mfrString = $('*[class^="code"]').first().text();

        let mfr = ''
        if (!mfrString) {
          mfr
        } else {
          const name1 = mfrString.split("•");
          if (name1[1].startsWith(" MFR")) {
            const mfr1 = name1[1];
            mfr = mfr1.replace(" MFR #", "");
          } else {
            mfr = "";
          }
        }

        //KEY FEATURES
        const featureSearch = $('li[class^="listItem"]')
          .map(function () {
            return $(this).text();
          })
          .get();
        let features = []
        if (!featureSearch) {
          features;
        } else {
          features = featureSearch;
        }

        //inTheBox
        const inTheBoxSearch = $('*[class^="list_2Pr"] li')
          .map(function () {
            return $(this).text();
          })
          .get();
        let inTheBox = []
        if (!inTheBoxSearch) {
          inTheBox
        } else {
          inTheBox = inTheBoxSearch;
        }

        //url
        const url = window.location.href;

        return {
          name,
          points,
          slug,
          mfr,
          brand,
          brandSlug,
          logo,
          category,
          categorySlug,
          categoryParent,
          categoryParentSlug,
          categoryGrandParent,
          categoryGrandParentSlug,
          inTheBox,
          features,
          imageId,
          images,
          url: url
        };
      });

      //////////////------------------------------------------------ START SPECS-----------------------------------


      const dataSpecs = await page.evaluate(() => {

        let length = null;
        let width = null;
        let height = null

        //SPECS LABLES
        const lablesSearch = $('td[class^="label_"]')
          .map(function () {
            return $(this).text();
          })
          .get();
        let lables = []
        if (!lablesSearch) {
          lables
        } else {
          lables = lablesSearch;
        }
        //SPECS VALUES
        const valuesSearch = $('td[class^="value_"] span')
          .map(function () {
            return $(this)
              .html()
              .replace(/\<br\>/g, "\n")
              .replace(/\<br \/\>/g, "\n")
              .replace(/&nbsp;/g, " ");

            // .replace(/\<i\>/g, '');
          })
          .get();
        let values = []
        if (!valuesSearch) {
          values
        } else {
          values = valuesSearch;
        }

        //cleaning values
        for (let j = 0; j < values.length; j++) {
          if (values[j].startsWith("<span class=")) {
            values.splice(j, 1);
            j--;
          }

          if (values[j].startsWith("<svg class=")) {
            values.splice(j, 1);
            j--;
          }

          if (values[j].startsWith("<span tabindex=")) {
            values.splice(j, 1);
            j--;
          }
          if (values[j].startsWith('<span class="notSpec')) {
            values.splice(j, 1);
            j--;
          }
          if (values[j].includes("<i>")) {
            values[j] = values[j].replace("</i>", "").replace("<i>", "");
            j--;
          }
          if (values[j].includes("<strong>")) {
            values[j] = values[j]
              .replace("<strong>", "")
              .replace("</strong>", "");
            j--;
          }
          if (values[j].includes("<sup>")) {
            values[j] = values[j].replace("<sup>", "").replace("</sup>", "");
            j--;
          }
          if (values[j].includes("<p>")) {
            values[j] = values[j].replace("</p>", "").replace("<p>", "");
            j--;
          }
          if (values[j].includes("<em>")) {
            values[j] = values[j].replace("</em>", "").replace("<em>", "");
            j--;
          }
          if (values[j].includes("<b>")) {
            values[j] = values[j].replace(/<b>/g, "").replace(/<\/b>/g, "");
            j--;
          }

        }

        //CHANGING PIXEL
        const pixel = values.find(m => m.startsWith("Actual"));
        const pixelIndex = values.findIndex(m => m.startsWith("Actual"));
        if (!pixel) {
          values = values;
        } else {
          const pixel1 = pixel.replace("lE", "l, E");
          values[pixelIndex] = pixel1;
        }

        //CHANGING FOCUS - Normal
        const focus = values.find(m => m.startsWith("Normal"));
        const focusIndex = values.findIndex(m => m.startsWith("Normal"));
        if (!focus) {
          values = values;
        } else {
          const focus1 = focus.replace("Normal", "Normal: ");
          values[focusIndex] = focus1;
        }

        //CHANGING FOCUS - Macro
        const focus1 = values.find(m => m.startsWith("Normal"));
        const focus1Index = values.findIndex(m => m.startsWith("Normal"));
        if (!focus1) {
          values = values;
        } else {
          const focus2 = focus1.replace("Macro", "\nMacro: ");
          values[focus1Index] = focus2;
        }

        //CHANGING MACRO
        const macro = values.find(m => m.startsWith("Macro"));
        const macroIndex = values.findIndex(m => m.startsWith("Macro"));
        if (!macro) {
          values = values;
        } else {
          const macro1 = focus1.replace("Macro", "\nMacro: ");
          values[macroIndex] = macro1;
        }

        //CHANGING REC MODES
        const regex = /\<br\>/g;
        const rec = values.find(m => m.startsWith("XAV"));
        const recIndex = values.findIndex(m => m.startsWith("XAV"));
        if (!rec) {
          values = values;
        } else {
          const rec1 = rec.replace(regex, "\n");
          values[recIndex] = rec1;
        }

        //CHANGING WIRELESS
        const wire = values.find(m => m.startsWith("Wi-Fi"));
        const wireIndex = values.findIndex(m => m.startsWith("Wi-Fi"));
        if (!wire) {
          values = values;
        } else {
          const wire1 = wire.replace("Wi-Fi", "Wi-Fi, ");
          values[wireIndex] = wire1;
        }

        //CHANGING WIRELESS 1
        const wire2 = values.find(m => m.startsWith("Bluetooth"));
        const wire2Index = values.findIndex(m => m.startsWith("Bluetooth"));
        if (!wire2) {
          values = values;
        } else {
          const wire3 = wire2.replace("Bluetooth", "Bluetooth, ");
          values[wire2Index] = wire3;
        }

        //SHUTTER 1a - Mechanical
        const shutter = values.find(m => m.startsWith("Mechanical"));
        const shutterIndex = values.findIndex(m => m.startsWith("Mechanical"));
        if (!shutter) {
          values = values;
        } else {
          const shutter1 = shutter.replace(
            "Mechanical Shutter",
            "Mechanical Shutter: "
          );
          values[shutterIndex] = shutter1;
        }
        //SHUTTER 1b - Electronic
        const shutter1e = values.find(m => m.startsWith("Electronic"));
        const shutter1eIndex = values.findIndex(m =>
          m.startsWith("Electronic")
        );
        if (!shutter1e) {
          values = values;
        } else {
          const shutter1f = shutter1e.replace(
            "Electronic Front Curtain Shutter",
            "Electronic Front Curtain Shutter: "
          );

          values[shutter1eIndex] = shutter1f;
        }

        //SHUTTER 1c - Electronic Front
        const shutter1ef = values.find(m => m.startsWith("Electronic Front"));
        const shutter1efIndex = values.findIndex(m =>
          m.startsWith("Electronic Front")
        );
        if (!shutter1ef) {
          values = values;
        } else {
          const shutter1fe2 = shutter1ef.replace(
            "Electronic Front Curtain Shutter",
            "Electronic Front Curtain Shutter: "
          );
          values[shutter1efIndex] = shutter1fe2;
        }

        // //SHUTTER 2 - Mechanical + Front
        const shutter2 = values.find(m => m.startsWith("Mechanical"));
        const shutter2Index = values.findIndex(m =>
          m.startsWith("Mechanical")
        );
        if (!shutter2) {
          values = values;
        } else {
          const shutter2a = shutter2.replace(
            "Electronic Front Curtain Shutter",
            "\n Electronic Front Curtain Shutter: "
          );
          values[shutter2Index] = shutter2a;
        }

        // //SHUTTER 3 - Mechanical + Front + Electronic
        const shutter3 = values.find(m => m.startsWith("Mechanical"));
        const shutter3Index = values.findIndex(m =>
          m.startsWith("Mechanical")
        );
        if (!shutter3) {
          values = values;
        } else {
          const shutter3a = shutter3.replace(
            "Electronic Shutter",
            "\n Electronic Shutter: "
          );
          values[shutter3Index] = shutter3a;
        }

        //SPECS
        const specifications = [];
        for (let i = 0; i < lables.length; i++) {
          specifications.push({ name: lables[i], value: values[i] });
        }

        //WEIGHT 

        const weightSearch1 = specifications.find(o => o.name === "Weight");
        let weight = null
        if (!weightSearch1) {
          weight
        } else if (weightSearch1.value.startsWith("Not Specified by")) {
          weight
        } else if (weightSearch1.value.startsWith("Not specified by")) {
          weight
        } else {
          if (weightSearch1.value.includes("oz /") === true) {
            weight = Math.ceil(parseFloat(weightSearch1.value) * 28.35);
          }
          else if (weightSearch1.value.includes("lb /") === true) {
            weight = Math.ceil(parseFloat(weightSearch1.value) / 0.0022046);
          }

        }
        if (weight === null) {
          const weightSearch2 = specifications.find(o => o.name === "Package Weight");

          if (!weightSearch2) {
            weight
          } else if (weightSearch2.value.startsWith("Not Specified by")) {
            weight
          } else if (weightSearch2.value.startsWith("Not specified by")) {
            weight
          } else {
            if (weightSearch2.value.includes("oz") === true) {
              weight = Math.ceil(parseFloat(weightSearch2.value) * 28.35);
            }
            else if (weightSearch2.value.includes("lb") === true) {
              weight = Math.ceil(parseFloat(weightSearch2.value) / 0.0022046);
            }
          }
        }

        //DIMENSIONS (Most Likely Cameras)

        const dimensionsOption = ['Dimensions', 'Overall Dimensions', 'Dimensions (L x W x H)']
        for (const variation of dimensionsOption) {

          if (length === null && width === null && height === null) {
            const dimensions = specifications.find(o => o.name === `${variation}`);
            if (!dimensions) {
              width
              length
              height
            } else if (dimensions.value.startsWith("Not Specified by")) {
              width
              length
              height
            } else if (dimensions.value.startsWith("Not specified by")) {
              width
              length
              height
            } else {
              if (dimensions.value.endsWith('cm')) {
                const dim1 = dimensions.value.split("/");
                const dim2 = dim1[1].split("x");
                length = Math.ceil(parseFloat(dim2[0]) * 10);
                width = Math.ceil(parseFloat(dim2[1]) * 10);
                height = Math.ceil(parseFloat(dim2[2]) * 10);
              }
              else if (dimensions.value.endsWith('mm')) {
                const dim1 = dimensions.value.split("/");
                const dim2 = dim1[1].split("x");
                length = Math.ceil(parseFloat(dim2[0]));
                width = Math.ceil(parseFloat(dim2[1]));
                height = Math.ceil(parseFloat(dim2[2]));
              }
              else if (dimensions.value.endsWith('cm (Folded)')) {
                const dim1 = dimensions.value.split("/");
                const dim2 = dim1[1].split("x");
                length = Math.ceil(parseFloat(dim2[0]) * 10);
                width = Math.ceil(parseFloat(dim2[1]) * 10);
                height = Math.ceil(parseFloat(dim2[2]) * 10);
              }
              else if (dimensions.value.endsWith('mm (Folded)')) {
                const dim1 = dimensions.value.split("/");
                const dim2 = dim1[1].split("x");
                length = Math.ceil(parseFloat(dim2[0]));
                width = Math.ceil(parseFloat(dim2[1]));
                height = Math.ceil(parseFloat(dim2[2]));
              }
              else if (dimensions.value.endsWith('cm)')) {
                const dim1 = dimensions.value.split("/");
                const dim2 = dim1[1].split("x");
                length = Math.ceil(parseFloat(dim2[0]) * 10);
                width = Math.ceil(parseFloat(dim2[1]) * 10);
                height = Math.ceil(parseFloat(dim2[2]) * 10);
              }
              else if (dimensions.value.endsWith('mm)')) {
                const dim1 = dimensions.value.split("/");
                const dim2 = dim1[1].split("x");
                length = Math.ceil(parseFloat(dim2[0]));
                width = Math.ceil(parseFloat(dim2[1]));
                height = Math.ceil(parseFloat(dim2[2]));
              }
              else if (dimensions.value.endsWith('cm (Unfolded)')) {
                const dim1 = dimensions.value.split("/");
                const dim2 = dim1[1].split("x");
                length = Math.ceil(parseFloat(dim2[0]) * 10);
                width = Math.ceil(parseFloat(dim2[1]) * 10);
                height = Math.ceil(parseFloat(dim2[2]) * 10);
              }
              else if (dimensions.value.endsWith('mm (Unfolded)')) {
                const dim1 = dimensions.value.split("/");
                const dim2 = dim1[1].split("x");
                length = Math.ceil(parseFloat(dim2[0]));
                width = Math.ceil(parseFloat(dim2[1]));
                height = Math.ceil(parseFloat(dim2[2]));
              }

            }
          }

        }

        //DIMENSIONS (Most Likely Lenses)


        //DATES
        const utcDateString = new Date(new Date().toUTCString())
          .toISOString()
          .replace("T", " ")
          .replace("Z", "+00");

        const createdAt = utcDateString
        const updatedAt = utcDateString

        return { specifications, weight, length, width, createdAt, updatedAt, height }
      }
      )

      if (data.mfr != "") {
        if (data.name.includes("Kit") != true) {
          if (data.name.includes(" with") != true) {
            if (data.name.includes("Bundle") != true) {
              if (data.images === "") {
                data.imageId = "none";
              } else {
                const fileName = uuidv1() + ".jpg";
                data.imageId = fileName;
              }
              if (data.points === 0) {
                data.points = body.price
              }
              newItem = { ...data, ...dataSpecs };
              console.log(newItem)

              try {
                let brandId;
                brandId = await this.brandRepository.findOne({
                  where: { slug: data.brandSlug }
                });
                if (brandId.id === undefined) {
                  await this.brandRepository.create({
                    name: data.brand,
                    slug: data.brandSlug,
                    createdAt: dataSpecs.createdAt,
                    updatedAt: dataSpecs.updatedAt
                  }).then(async brand => {
                    console.log("New Brand", brand)
                  })
                  brandId = await this.brandRepository.findOne({
                    where: { slug: data.brandSlug }
                  });
                }

                let categoryId;
                categoryId = await this.categoryRepository.findOne({
                  where: { slug: data.categorySlug }
                });
                if (categoryId.id === undefined) {
                  const parentCategoryId = await this.categoryRepository.findOne({
                    where: { slug: data.categoryParentSlug }
                  });
                  await this.categoryRepository.create({
                    name: data.category,
                    slug: data.categorySlug,
                    parentId: parentCategoryId.id,
                    createdAt: dataSpecs.createdAt,
                    updatedAt: dataSpecs.updatedAt
                  }).then(async brand => {
                    console.log("New Category", brand)
                  })
                  categoryId = await this.categoryRepository.findOne({
                    where: { slug: data.categorySlug }
                  });
                }

                console.log(brandId.id)
                console.log(categoryId.id)

                // await this.productRepository.create({

                //   slug: data.slug,
                //   length: dataSpecs.length,
                //   features: data.features,
                //   height: dataSpecs.height,
                //   inTheBox: data.features,
                //   mfr: data.mfr,
                //   name: data.name,
                //   weight: dataSpecs.weight,
                //   width: dataSpecs.width,
                //   createdAt: dataSpecs.createdAt,
                //   updatedAt: dataSpecs.updatedAt,
                //   brandId: brandId.id,
                //   categoryId: categoryId.id,
                //   images: [data.imageId],
                //   points: data.points
                // }).then(async newRecord => {

                //   console.log("New Item", newRecord.id)
                //   if (dataSpecs.specifications.length != 0) {
                //     for (const spec of dataSpecs.specifications) {

                //       console.log(spec.name)
                //       let specNameId;
                //       specNameId = await this.productAttributeRepository.findOne({
                //         where: { name: spec.name }
                //       });

                //       if (specNameId === null) {
                //         await this.productAttributeRepository.create({
                //           name: spec.name,
                //           createdAt: dataSpecs.createdAt,
                //           updatedAt: dataSpecs.updatedAt
                //         }).then(async specName => {
                //           console.log("New Specification Name", specName)
                //         })
                //         specNameId = await this.productAttributeRepository.findOne({
                //           where: { name: spec.name }
                //         });

                //       }
                //       await this.productAttributeValueRepository.create({
                //         value: spec.value,
                //         productAttributeId: specNameId.id,
                //         productId: newRecord.id,
                //         createdAt: dataSpecs.createdAt,
                //         updatedAt: dataSpecs.updatedAt
                //       }).then(async specValue => {
                //         console.log("New Specification Value", specValue)
                //       })
                //     }
                //   }
                //   this.logger.log(`Inserted to DB (SEQUELIZE) Item: ID `, newRecord.id)
                // })

              } catch (e) {

                this.logger.error(`Failed with Inserting to DB (SEQUELIZE) `, e.stack)
              }

            }
          }
        }
      }
      if (data.name.includes("We're Sorry!") === true) {
        this.logger.error(`Page Does Not Exists`)
        throw new Error(`Page Does Not Exists`)
      }
      await page.close();
      await browser.close();
    } catch (e) {
      console.log(e);
      this.logger.error(`Item Was Not Inserted`, e.stack)
      throw new ForbiddenException();
    }

    this.logger.log(`Item Inserted`)
    return

  }


}
