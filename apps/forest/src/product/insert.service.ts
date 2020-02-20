import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { Product, Category, Brand, ProductAttribute, ProductAttributeValue } from '@app/database/entities';
import * as puppeteer from 'puppeteer'
import *  as uuidv1 from 'uuid'
import * as request from 'request'
import { Storage } from '@google-cloud/storage'


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

  async insertItem(bhUrl, bhPrice): Promise<Product[]> {


    //////////////---------------------------------------------------- INSERT PICTURE TO GCP------------------------------------

    async function saveToStorage(attachmentUrl: string, objectName: string) {
      try {
        const storage = new Storage({
          projectId: process.env.GCLOUD_PROJECT
        }
        );
        const bucket = process.env.GCLOUD_STORAGE_BUCKET
        const req = request(attachmentUrl);
        req.pause();
        req.on("response", res => {
          if (res.statusCode !== 200) {
            return;
          }
          const writeStream = storage
            .bucket(bucket)
            .file(objectName)
            .createWriteStream({
              gzip: true,
              public: true,
              metadata: {
                contentType: res.headers["content-type"]
              }
            });
          req
            .pipe(writeStream)
            .on("finish", () => console.log("Saved"))
            .on("error", err => {
              writeStream.end();
              console.error(err);
            });
          req.resume();
        });
        req.on("error", err => console.error(err));

      }
      catch (e) {
        this.logger.error(`Picture Was Not Inserted`, e.stack)
      }
    }

    //////////////---------------------------------------------------- CRAWLING PAGE------------------------------------
    try {
      let newItem: any
      let data: any
      let dataSpecs: any
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      const result = await page.goto(
        bhUrl,
        {
          waitUntil: "networkidle2",
          timeout: 120000
        }
      );
      if (result.status() === 404) {
        throw new NotFoundException("Page Does Not Exists");
      }

      await page.addScriptTag({
        url: "https://code.jquery.com/jquery-3.2.1.min.js"
      });

      //////////////------------------------------------------------ START GENERAL---------------------------------
      try {
        data = await page.evaluate(() => {
          //CAMERA
          const cameraString = $('h1[class^="title"]').first().text();
          const name = cameraString ? cameraString
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
            .replace("FUJIFILM", "Fujifilm")
            .trim() : ''

          const slug = cameraString ? name
            .toLocaleLowerCase()
            .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
            .replace(/\ -/g, "")
            .replace(/\ /g, "-")
            .replace(/\---/g, "-")
            .replace(/\--/g, "-") : ''

          //CAMERA PRICE/POINTS
          const cameraPriceSearch = $('*[data-selenium^="pricingPrice"]').first().text();
          const points = cameraPriceSearch ? Math.ceil(parseInt(cameraPriceSearch.replace("$", "").replace(",", ""))) : 0;

          //IMG SRC
          const imgSrcString = $('img[class^="image"]').attr("src");
          let imagesHtml = imgSrcString ? imgSrcString : ''
          if (imagesHtml === "https://static.bhphoto.com/images/en/na500x500.jpg") {
            imagesHtml = "";
          }
          //IMG ID
          const images = imgSrcString ? "" : ""

          //IMG SRC LOGO
          const logoSrcString = $('*[data-selenium^="authorizedDealerLink"] img')
          const logo = logoSrcString ? logoSrcString.attr("src") : ""


          //BRAND NAME
          const brandSrcString = $('*[class^="dealer_"] img').attr("alt");
          const brandSrcString1 = $('*[class^="dealer_"] span').html();

          const brand = brandSrcString ? brandSrcString.replace("FUJIFILM", "Fujifilm")
            : brandSrcString1 ? brandSrcString1.replace(" <!-- -->", "").replace("<!-- --> ", "").replace("FUJIFILM", "Fujifilm") : ''
          const brandSlug = brandSrcString ? brand.toLocaleLowerCase()
            .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
            .replace(/\ -/g, "")
            .replace(/\ /g, "-")
            .replace(/\---/g, "-")
            .replace(/\--/g, "-")
            : brandSrcString1 ? brand.toLocaleLowerCase()
              .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
              .replace(/\ -/g, "")
              .replace(/\ /g, "-")
              .replace(/\---/g, "-")
              .replace(/\--/g, "-") : ''


          //CATEGORY
          const categoryString = $('a[class^="linkCrumb_"]').last().text();
          const category = categoryString ? categoryString : ''
          const categorySlug = categoryString ? category.toLowerCase()
            .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
            .replace(/\ -/g, "")
            .replace(/\ /g, "-")
            .replace(/\--/g, "-")
            .replace(/\---/g, "-") : ''

          //CATEGORY PARENT
          const categoryParentString = $('a[class^="linkCrumb_"]')
            .eq(-2)
            .text();
          const categoryParent = categoryParentString ? categoryParentString : ''
          const categoryParentSlug = categoryParent ? categoryParent.toLowerCase()
            .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
            .replace(/\ -/g, "")
            .replace(/\ /g, "-")
            .replace(/\--/g, "-")
            .replace(/\---/g, "-") : ''

          //CATEGORY GRANDPARENT
          const categoryGrandParentString = $('a[class^="linkCrumb_"]')
            .eq(-3)
            .text();
          const categoryGrandParent = categoryGrandParentString ? categoryGrandParentString : ''
          const categoryGrandParentSlug = categoryGrandParentString ? categoryGrandParent.toLowerCase()
            .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
            .replace(/\ -/g, "")
            .replace(/\ /g, "-")
            .replace(/\--/g, "-")
            .replace(/\---/g, "-") : ''

          //MFR
          const mfrString = $('*[class^="code"]').first().text();
          const mfrSplit = mfrString ? mfrString.split("•") : ''
          const mfr = mfrSplit[1].startsWith(" MFR") ? mfrSplit[1].replace(" MFR #", "") : ''

          //KEY FEATURES
          const featureSearch = $('li[class^="listItem"]')
            .map(function () {
              return $(this).text();
            })
            .get();
          const features = featureSearch ? featureSearch : []

          //IN THE BOX
          const inTheBoxSearch = $('*[class^="list_2Pr"] li')
            .map(function () {
              return $(this).text();
            })
            .get();
          const inTheBox = inTheBoxSearch ? inTheBoxSearch : []

          //URL
          const url = window.location.href;

          //DATES
          const utcDateString = new Date(new Date().toUTCString())
            .toISOString()
            .replace("T", " ")
            .replace("Z", "+00");

          const createdAt = utcDateString
          const updatedAt = utcDateString

          return {
            general: {
              name,
              points,
              slug,
              mfr,
              inTheBox,
              features,
              images,
              createdAt,
              updatedAt,
            },
            brand_info: {
              createdAt,
              updatedAt,
              brand,
              brandSlug,
              logo,
            },
            category_info: {
              createdAt,
              updatedAt,
              category,
              categorySlug,
              categoryParent,
              categoryParentSlug,
              categoryGrandParent,
              categoryGrandParentSlug,
            },
            imagesHtml,
            url: url
          };
        });
      } catch (e) {
        console.log(e)
      }
      //////////////------------------------------------------------ START SPECS-----------------------------------
      try {
        dataSpecs = await page.evaluate(() => {



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


            if (weightSearch1.value.includes("oz /") === true || weightSearch1.value.includes("oz ") === true) {
              weight = Math.ceil(parseFloat(weightSearch1.value) * 28.35);
            }
            else if (weightSearch1.value.includes("lb /") === true || weightSearch1.value.includes("lb ") === true) {
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
          let length = null;
          let width = null;
          let height = null;
          const dimensionsOption = ['Dimensions', 'Overall Dimensions', 'Dimensions (L x W x H)', 'Dimensions (W x H x D)', 'Dimensions (WxHxD)']
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
                  const dim1 = dimensions.value.includes("/") ? dimensions.value.split("/") : dimensions.value.split("(")
                  const dim2 = dim1[1].split("x");
                  length = Math.ceil(parseFloat(dim2[0]));
                  width = Math.ceil(parseFloat(dim2[1]));
                  height = Math.ceil(parseFloat(dim2[2]));
                }
                else if (dimensions.value.endsWith('cm (Folded)')) {
                  const dim1 = dimensions.value.includes("/") ? dimensions.value.split("/") : dimensions.value.split("(")
                  const dim2 = dim1[1].split("x");
                  length = Math.ceil(parseFloat(dim2[0]) * 10);
                  width = Math.ceil(parseFloat(dim2[1]) * 10);
                  height = Math.ceil(parseFloat(dim2[2]) * 10);
                }
                else if (dimensions.value.endsWith('mm (Folded)')) {
                  const dim1 = dimensions.value.includes("/") ? dimensions.value.split("/") : dimensions.value.split("(")
                  const dim2 = dim1[1].split("x");
                  length = Math.ceil(parseFloat(dim2[0]));
                  width = Math.ceil(parseFloat(dim2[1]));
                  height = Math.ceil(parseFloat(dim2[2]));
                }
                else if (dimensions.value.endsWith('cm)')) {
                  const dim1 = dimensions.value.includes("/") ? dimensions.value.split("/") : dimensions.value.split("(")
                  //const dim1 = dimensions.value.split("/");
                  const dim2 = dim1[1].split("x");
                  length = Math.ceil(parseFloat(dim2[0]) * 10);
                  width = Math.ceil(parseFloat(dim2[1]) * 10);
                  height = Math.ceil(parseFloat(dim2[2]) * 10);
                }
                else if (dimensions.value.endsWith('mm)')) {
                  const dim1 = dimensions.value.includes("/") ? dimensions.value.split("/") : dimensions.value.split("(")
                  const dim2 = dim1[1].split("x");
                  length = Math.ceil(parseFloat(dim2[0]));
                  width = Math.ceil(parseFloat(dim2[1]));
                  height = Math.ceil(parseFloat(dim2[2]));
                }
                else if (dimensions.value.endsWith('cm (Unfolded)')) {
                  const dim1 = dimensions.value.includes("/") ? dimensions.value.split("/") : dimensions.value.split("(")
                  const dim2 = dim1[1].split("x");
                  length = Math.ceil(parseFloat(dim2[0]) * 10);
                  width = Math.ceil(parseFloat(dim2[1]) * 10);
                  height = Math.ceil(parseFloat(dim2[2]) * 10);
                }
                else if (dimensions.value.endsWith('mm (Unfolded)')) {
                  const dim1 = dimensions.value.includes("/") ? dimensions.value.split("/") : dimensions.value.split("(")
                  const dim2 = dim1[1].split("x");
                  length = Math.ceil(parseFloat(dim2[0]));
                  width = Math.ceil(parseFloat(dim2[1]));
                  height = Math.ceil(parseFloat(dim2[2]));
                }

              }
            }

          }

          //DIMENSIONS (Most Likely Lenses)

          if (length === null && width === null && height === null) {

            const dimensionsOptionLens = ['Dimensions (']
            for (const variation of dimensionsOptionLens) {

              if (length === null && width === null && height === null) {
                let dimensions = null
                dimensions = specifications.find(o => o.name.startsWith(`${variation}`));

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
                }
                else {
                  if (dimensions.value.endsWith('cm')) {
                    const dim1 = dimensions.value.split("/");
                    const dim2 = dim1[1].split("x");
                    length = Math.ceil(parseFloat(dim2[1]) * 10);
                    width = Math.ceil(parseFloat(dim2[0]) * 10);
                    height = Math.ceil(parseFloat(dim2[0]) * 10);
                  }
                  else if (dimensions.value.endsWith('mm')) {
                    const dim1 = dimensions.value.split("/");
                    const dim2 = dim1[1].split("x");
                    length = Math.ceil(parseFloat(dim2[1]));
                    width = Math.ceil(parseFloat(dim2[0]));
                    height = Math.ceil(parseFloat(dim2[0]));
                  }
                }
              }
            }
          }

          //DATES
          const utcDateString = new Date(new Date().toUTCString())
            .toISOString()
            .replace("T", " ")
            .replace("Z", "+00");

          const createdAt = utcDateString
          const updatedAt = utcDateString

          return {
            specs: {
              specifications, createdAt,
              updatedAt
            },
            general: { weight, length, width, createdAt, updatedAt, height }
          }
        });
      } catch (e) {
        console.log(e)
      }
      //////////////------------------------------------------------ CHECK ----------------------------------------
      if (data.general.name.includes("We're Sorry!") === true) {
        this.logger.error(`Page Does Not Exists`)
        throw new NotFoundException();
      }

      //////////////---------------------------------------------------- INSERT------------------------------------
      if (data.general.mfr != "") {
        if (data.general.name.includes("Kit") != true) {
          if (data.general.name.includes(" with") != true) {
            if (data.general.name.includes("Bundle") != true) {
              if (data.imagesHtml === "") {
                data.general.images = "none";
              } else {
                const fileName = uuidv1() + ".jpg";
                data.general.images = [fileName]
                //  await saveToStorage(data.general.images, data.imageId);
              }
              if (data.general.points === 0) {
                data.general.points = bhPrice
              }
              newItem = { general: { ...data.general, ...dataSpecs.general }, brand_info: { ...data.brand_info }, category_info: { ...data.category_info }, specs: { ...dataSpecs.specs } };
              console.log(newItem)

              try {

                const brand = newItem.brand_info
                let brandId;
                console.log(brand)
                brandId = await this.brandRepository.findOne({
                  where: { slug: brand.brandSlug }
                });
                if (brandId.id === undefined) {
                  await this.brandRepository.create({
                    name: brand.brand,
                    slug: brand.brandSlug,
                    createdAt: brand.createdAt,
                    updatedAt: brand.updatedAt
                  }).then(async brand => {
                    console.log("New Brand", brand)
                  })
                  brandId = await this.brandRepository.findOne({
                    where: { slug: brand.brandSlug }
                  });
                }

                const category = newItem.category_info
                let categoryId;
                categoryId = await this.categoryRepository.findOne({
                  where: { slug: category.categorySlug }
                });
                if (categoryId.id === undefined) {
                  const parentCategoryId = await this.categoryRepository.findOne({
                    where: { slug: category.categoryParentSlug }
                  });
                  await this.categoryRepository.create({
                    name: category.category,
                    slug: category.categorySlug,
                    parentId: category.id,
                    createdAt: category.createdAt,
                    updatedAt: category.updatedAt
                  }).then(async brand => {
                    console.log("New Category", brand)
                  })
                  categoryId = await this.categoryRepository.findOne({
                    where: { slug: category.categorySlug }
                  });

                }

                console.log(brandId.id)
                console.log(categoryId.id)

                const product = newItem.general
                const specifications = newItem.specs
                await this.productRepository.create({
                  slug: product.slug,
                  length: product.length,
                  features: product.features,
                  height: product.height,
                  inTheBox: product.features,
                  mfr: product.mfr,
                  name: product.name,
                  weight: product.weight,
                  width: product.width,
                  createdAt: product.createdAt,
                  updatedAt: product.updatedAt,
                  brandId: brandId.id,
                  categoryId: categoryId.id,
                  images: product.imageId,
                  points: product.points
                }).then(async newRecord => {


                  if (specifications.length != 0) {
                    try {
                      for (const specification of specifications) {
                        let specNameId;
                        specNameId = await this.productAttributeRepository.findOne({
                          where: { name: specification.name }
                        });

                        if (specNameId === null) {
                          await this.productAttributeRepository.create({
                            name: specification.name,
                            createdAt: specification.createdAt,
                            updatedAt: specification.updatedAt
                          }).then(async specName => {
                            console.log("New Specification Name", specName.id)
                          })
                          specNameId = await this.productAttributeRepository.findOne({
                            where: { name: specification.name }
                          });
                        }
                        await this.productAttributeValueRepository.create({
                          value: specification.value,
                          productAttributeId: specNameId.id,
                          productId: newRecord.id,
                          createdAt: specification.createdAt,
                          updatedAt: specification.updatedAt
                        }).then(async specValue => {
                          console.log("New Specification Value", specValue.id)
                        })
                      }
                      this.logger.log(`Inserted to DB (SEQUELIZE) (SPECS) `)
                    }
                    catch (e) {
                      this.logger.error(`Inserted to DB (SEQUELIZE) (SPECS) `, e.stack)
                    }
                  }
                  this.logger.log(`Inserted to DB (SEQUELIZE) `, newRecord.id)
                })

              } catch (e) {
                this.logger.error(`Failed with Inserting to DB (SEQUELIZE) `, e.stack)
              }
            }
          }
        }
      }
      await page.close();
      await browser.close();
    } catch (e) {
      console.log(e);
      this.logger.error(`Item Was Not Inserted`, e.stack)
      throw new NotFoundException("Page Does Not Exists");
    }
    this.logger.log(`Item Inserted`)
    return
  }
}
