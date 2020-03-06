import { Injectable, Logger, Inject } from '@nestjs/common';
import puppeteer from 'puppeteer'
import { SearchService } from '../app-search.service';

@Injectable()
export class KEHService {
  private logger = new Logger('KEHService')
 

  constructor(
    private readonly SearchService: SearchService,

  ) { }


  async insertValues() {

    const pages = [
      "https://www.keh.com/shop/cameras/digital-cameras.html#ciq_g_3_page1",
      "https://www.keh.com/shop/cameras/film-cameras/35mm.html#ciq_g_3_page1",
      "https://www.keh.com/shop/video.html#ciq_g_3_page1",
      "https://www.keh.com/shop/lenses.html#ciq_g_3_page1"
    ];

    //ARRAY WITH ALL ITEMS
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
        page.setViewport({
          width: 1080,
          height: 1920
        }),
        page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36"),
        page.setRequestInterception(true),
        page.on('request', (request) => {
          if (['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !== -1) {
            request.abort();
          } else {
            request.continue();
          }
        })
      ])

      //ARRAY WITH ALL LINKS
      const allLinks = []

      //VARIABLES FOR GETTING NEW LINKS
      let data: any
      let newPage: any
      let oldPage: any

      //GETTING ALL ITEMS LINKS
      for (const kehpage of pages) {


        async function category(kehpage) {
          try {
            await page.goto(kehpage, {
              waitUntil: "networkidle2",
              timeout: 120000
            });
            let i = 1
            do {

              console.log(i)

              try {

                oldPage = await page.evaluate(() => {
                  const url = window.location.href;
                  return url;
                });

                data = await page.evaluate(() => {
                  const extractedElements = document.querySelectorAll(
                    'li[class^="item "] a[class^="product-details-link"]'
                  );

                  const items = [];

                  for (const element of extractedElements) {
                    const id = element.getAttribute("href");
                    items.push(id);
                  }
                  return items;
                });
                await page.waitFor(1000)

                const selector = 'a[class="button-cta fluid ciq_g_3_load_more"]';
                await page.evaluate((selector) => document.querySelector(selector).click(), selector);

                await page.waitFor(6000)

                newPage = await page.evaluate(() => {
                  const url = window.location.href;
                  return url;
                });

                if (oldPage === newPage) {
                  console.log("stop")
                  break
                }
                await page.reload(newPage);
                await page.waitFor(1000)

                console.log("Next Page ", newPage)
                console.log(data.length)

              }
              catch (e) {

                if (e.message === 'Node is either not visible or not an HTMLElement') {
                  //Error: Node is either not visible or not an HTMLElement
                  console.log(e.message)
                  console.log('No more Next Button')
                  break
                }

                else if (e.message === "Navigation timeout of 30000 ms exceeded") {
                  //Error: Navigation timeout of 30000 ms exceeded
                  console.log(e.message)
                  break
                }
                else { console.log(e) }
              }
              i = i + 1
            } while (i < 100)
            //100
            for (let p = 0; p < data.length; p++) {
              allLinks.push(data[p]);
            }
            console.log(allLinks.length)
          } catch (e) {
            console.log(e.message)
          }
        }


        await category(kehpage)
      }

      //   GETTING ALL ITEMS INFORMATION WITH ALL CONDITIONS AND MATCHED NAME
      for (let o = 0; o < allLinks.length; o++) {

        try {
          await page.goto(`${allLinks[o]}`, {
            waitUntil: "networkidle2",
            timeout: 120000
          });

          console.log(o);
          console.log(`${allLinks[o]}`)
          const camerasPrices = await page.evaluate(() => {
            let title = document.querySelector("h1")
              .innerText
              .replace(" Medium", "")
              .replace(" Mirrorless", "")
              .replace(" DSLR", "")
              .replace(" SLR", "")
              .replace(" SLR", "")
              .replace(" Digital", "")
              .replace(" Rangefinder", "")
              .replace(" Micro Four Thirds", "")
              .replace(" Body", "")
              .replace(" Cinema", "")
              .replace(" Full Frame", "")
              .replace(" Version", "")
              .replace(" Battery Grip", "")
              .replace(" (Requires Finder)", "")
              .replace(" 3200mAh", "")
              .replace(" 2900mAh", "")
              .replace(" Format", "")
              .replace(" Leather", "")
              .replace(" White Grip", "")
              .replace(" Black Leatherette", "")
              .replace(" (Camera Only)", "")
              .replace("Z7", "Z 7")
              .replace("5DSR", "5DS R")
              .replace("1DX", "1D X")
              .trim()

            if (title.includes(' {')) {
              const splitTitle = title.split('{')
              title = splitTitle[0].trim()

            }


            const priceSearch = document.querySelectorAll('span[class="regular-price"]')

            const price = priceSearch ? priceSearch : [];


            const iconConditionSearch = document.querySelectorAll('span[class^="icon icon-grade"]')

            const iconCondition = iconConditionSearch ? iconConditionSearch : [];

            const mfrSearch = document.querySelectorAll('tr[class="data-row"]')

            const mfr = mfrSearch ? mfrSearch : [];
            let mfrId = '';
            for (let p = 0; p < mfr.length; p++) {
              if (mfr[p].innerText.includes("Manufacturer Part Number")) {
                mfrId = mfr[p].innerText.replace("Manufacturer Part Number\t", "")
              }
            }

            const matchConditions = [
              { parchut_cond: "NEW", keh_cond: "icon icon-grade icon-grade-n" },
              {
                parchut_cond: "LIKENEW",
                keh_cond: "icon icon-grade icon-grade-ln"
              },
              {
                parchut_cond: "LIKENEW",
                keh_cond: "icon icon-grade icon-grade-lnminus"
              },
              {
                parchut_cond: "EXCELLENT",
                keh_cond: "icon icon-grade icon-grade-explus"
              },
              {
                parchut_cond: "EXCELLENT",
                keh_cond: "icon icon-grade icon-grade-ex"
              },
              { parchut_cond: "USED", keh_cond: "icon icon-grade icon-grade-bgn" },
              { parchut_cond: "USED", keh_cond: "icon icon-grade icon-grade-ug" },
              { parchut_cond: "DAMAGED", keh_cond: "icon icon-grade icon-grade-ai" }
            ];

            const allPrices = [];
            for (let i = 0; i < price.length; i++) {

              const match = matchConditions.find(x =>
                x.keh_cond.includes(iconCondition[i].getAttribute('class'))
              );

              allPrices.push({
                price: Math.ceil(parseFloat(price[i].innerText.replace("$", "").replace(",", ""))),
                condition: match.parchut_cond,
                source: "KEH"
              });
            }
            //DATES
            const utcDateString = new Date(new Date().toUTCString())
              .toISOString()
              .replace("T", " ")
              .replace("Z", "+00");

            const createdAt = utcDateString
            const updatedAt = utcDateString

            return {
              title,
              matched_name: '',
              matched_mfr_id: '',
              createdAt: createdAt,
              updatedAt: updatedAt,
              source: "KEH",
              mfr_id: mfrId,
              all_prices: allPrices
            };
          });

          if (camerasPrices.title.includes("KIT") === false) {
            if (camerasPrices.all_prices.length != 0) {

              if (camerasPrices.title.includes('Camera') === true) {
                if ((camerasPrices.title.includes('With') === true && camerasPrices.title.includes('Lens') != true) || camerasPrices.title.includes('With') === false) {

                  const cameraSearchResults = await this.SearchService.cameraSearch(camerasPrices)

                  cameraSearchResults.title = cameraSearchResults.title.replace("with", "").replace("With", "").replace(" Camera", "")
                  cameraSearchResults.title = cameraSearchResults.title
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
          }
        } catch (e) {
          console.log(e.message)
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