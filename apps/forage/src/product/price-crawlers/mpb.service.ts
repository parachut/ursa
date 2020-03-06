import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer'
import { SearchService } from '../app-search.service';

@Injectable()
export class MPBService {
  private logger = new Logger('ValueService')
  constructor(
    private readonly SearchService: SearchService,
  ) { }

  async insertValues() {

    const pages = [
      "https://www.mpb.com/en-us/used-equipment/used-photo-and-video/used-lenses/",
      "https://www.mpb.com/en-us/used-equipment/used-photo-and-video/used-digital-slr-cameras/",
      "https://www.mpb.com/en-us/used-equipment/used-photo-and-video/used-compact-system-cameras/",
      "https://www.mpb.com/en-us/used-equipment/used-photo-and-video/used-video-cameras/",
      "https://www.mpb.com/en-us/used-equipment/used-photo-and-video/used-digital-medium-format-cameras/",
      "https://www.mpb.com/en-us/used-equipment/used-photo-and-video/used-digital-rangefinder-cameras/"
    ];
    const allPagesToCrawl = [];
    const allInfo = [];

    try {
      //NEW BROWSER
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"]
      });

      //NEW PAGE
      const page = await browser.newPage();

      //PAGE SETTINGS
      await Promise.all([
        page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36"
        ),
        page.setViewport({
          width: 1080,
          height: 1920
        }),
        page.setRequestInterception(true),
        page.on('request', (request) => {
          if (['image', 'font', 'media', 'other', 'manifest'].indexOf(request.resourceType()) !== -1) {
            request.abort();
          } else {
            request.continue();
          }
        })
      ])

      //GETTING ALL ITEMS LINKS
      for (const mpbPage of pages) {

        console.log("Page : ", mpbPage);
        try {
          await page.goto(`${mpbPage}`, {
            waitUntil: "networkidle2",
            timeout: 120000
          });

          let data: any
          await page.waitFor(1000);
          while (
            await page.evaluate(
              () =>
                document.scrollingElement.scrollTop + window.innerHeight <
                document.scrollingElement.scrollHeight
            )
          ) {
            data = await page.evaluate(() => {
              const extractedElements = document.querySelectorAll(
                'a[class^="www-model-list-name www-model-link"]'
              );

              const items = [];
              for (const element of extractedElements) {
                const id = "https://www.mpb.com" + element.getAttribute("href");
                items.push(id);
              }
              return items;
            });

            console.log(data.length)
            await page.evaluate(y => {
              document.scrollingElement.scrollBy(0, y);
            }, 500);
            await page.waitFor(3500);
          }

          for (let j = data.length - 1; j >= 0; j--) {
            allPagesToCrawl.unshift(data[j]);
          }
          console.log("Number of new cameras : ", allPagesToCrawl.length);
        }
        catch (e) {
          console.log(e.message)
        }

      }

      //GETTING ALL ITEMS INFORMATION WITH ALL CONDITIONS

      for (let o = 0; o < allPagesToCrawl.length; o++) {
        await page.goto(`${allPagesToCrawl[o]}`, {
          waitUntil: "networkidle2",
          timeout: 120000
        });

        const camerasPrices = await page.evaluate(() => {
          const title = $("h1")
            .text()
            .replace(" Medium Format", "")
            .replace(" Mirrorless Digital", "")
            .replace(" DSLR Camera", "")
            .replace(" Digital SLR Camera", "")
            .replace(" Rangefinder Digital Camera Body", "")
            .replace(" Camera", "")
            .replace(" SLR Digital", "")
            .replace(" Digital Camera", "")
            .replace(" Digital Rangefinder", "")
            .replace(" Mirrorless Micro Four Thirds Digital", "")
            .replace(" Micro Four Thirds Digital", "")
            .replace(" Micro Four Thirds", "")
            .replace(" (Camera Body)", "")
            .replace(" Camera Body", "")
            .replace(" Camera Body,", "")
            .replace("  Point-and-Shoot", "")
            .replace(" Body", "")
            .replace("Used ", "");

          const prices = $("h3").find('b[class^="www-product-price"]').first();
          let price = 0;

          if (prices != undefined) {
            price = parseInt(
              prices.text().replace("$", "").replace(",", "").replace(".00", "")
            );
          }

          const iconCondition = $(
            '*[class^="theme-accent www-product-condition"]'
          );
          let condition = "";
          if (iconCondition != undefined) {
            condition = iconCondition.text();
          }

          const matchConditions = [
            { parchut_cond: "NEW", mpb_cond: "New" },
            {
              parchut_cond: "LIKENEW",
              mpb_cond: "Like New"
            },
            {
              parchut_cond: "EXCELLENT",
              mpb_cond: "Excellent"
            },
            { parchut_cond: "USED", mpb_cond: "Good" },
            { parchut_cond: "USED", mpb_cond: "Well Used" },
            { parchut_cond: "USED", mpb_cond: "Heavily Used" },
            { parchut_cond: "DAMAGED", mpb_cond: "S/R" },
            { parchut_cond: "DAMAGED", mpb_cond: "Faulty" }
          ];

          let allPrices = [];

          const match = matchConditions.find(x => x.mpb_cond.includes(condition));
          const source = "MPB";
          if (typeof price != "object") {
            allPrices.push({
              condition: match.parchut_cond,
              price: price,
              source: source
            });
          }

          const conditions = $(
            'td[class^="theme-meta-rating www-product-condition"]'
          )
            .map(function () {
              return $(this).text();
            })
            .get();

          const prices2 = $('strong[class^="www-product-price"]')
            .map(function () {
              return $(this).text();
            })
            .get();
          if (conditions.length != 0) {
            allPrices = [];

            for (let i = 0; i < conditions.length; i++) {
              const match = matchConditions.find(x =>
                x.mpb_cond.includes(conditions[i])
              );
              allPrices.push({
                condition: match.parchut_cond,
                price: parseInt(
                  prices2[i].replace("$", "").replace(",", "").replace(".00", "")
                ),
                source: source
              });
            }
          }

          //DATES
          const utcDateString = new Date(new Date().toUTCString())
            .toISOString()
            .replace("T", " ")
            .replace("Z", "+00");

          const createdAt = utcDateString
          const updatedAt = utcDateString
          const url = window.location.href;
          return {
            url: url,
            title: title,
            matched_name: '',
            matched_mfr_id: '',
            mfr_id: '',
            createdAt: createdAt,
            updatedAt: updatedAt,
            source: source,
            all_prices: allPrices
          };
        });

        if (camerasPrices.all_prices[0].price != null) {
          if (camerasPrices.title != "") {
            if (camerasPrices.title.includes("Kit") === false) {
              if (camerasPrices.url.includes('used-lenses/') === false) {
                if ((camerasPrices.title.includes('With') === true && camerasPrices.title.includes('Lens') != true) || camerasPrices.title.includes('With') === false) {

                  const cameraSearchResults = await this.SearchService.cameraSearch(camerasPrices)
                  console.log(cameraSearchResults);
                  if (cameraSearchResults.mfr_id == '' && cameraSearchResults.matched_mfr_id == '') {
                    console.log("No", cameraSearchResults.title)
                  } else {
                    console.log(cameraSearchResults.matched_mfr_id)
                    allInfo.push(cameraSearchResults);
                  }
                }
              }
              else {

                const cameraSearchResults = await this.SearchService.lensSearch(camerasPrices)
                console.log(cameraSearchResults);
                if (cameraSearchResults.mfr_id == '' && cameraSearchResults.matched_mfr_id == '') {
                  console.log("No", cameraSearchResults.title)
                } else {
                  allInfo.push(cameraSearchResults);
                }

              }
            }
          }
        }
        console.log(allInfo.length)
      }

      await browser.close()
    } catch (e) {
      this.logger.error("Could not load First Page/ Run Puppeter", e.stack);
    }
    return allInfo
  }
}