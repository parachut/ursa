import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import puppeteer from 'puppeteer'

@Injectable()
export class BHService {
  private logger = new Logger('BHService')

  async insertValues() {

    const pages = [
      "https://www.bhphotovideo.com/c/buy/Used-DSLR-Cameras/ci/15488/ipp/100/N/4294182649/pn/1",
      "https://www.bhphotovideo.com/c/buy/Used-Mirrorless-Cameras/ci/21264/ipp/100/N/404/pn/1",
      "https://www.bhphotovideo.com/c/buy/Used-Point-Shoot-Cameras/ci/15487/ipp/100/N/4294182650/pn/1",
      "https://www.bhphotovideo.com/c/buy/medium-format-cameras/ci/38033/ipp/100/pn/1",
      "https://www.bhphotovideo.com/c/buy/Used-Digital-Camera-SLR-Interchangeable-Lenses/ci/10209/ipp/100/N/4036297804/pn/1",
      'https://www.bhphotovideo.com/c/buy/Used-Aerial-Photography/ci/27591/ipp/100/N/3788138143/pn1',
      'https://www.bhphotovideo.com/c/buy/used-cine-lenses/ci/27601/ipp/100/N/3802854962/pn1',
      'https://www.bhphotovideo.com/c/buy/Lenses/ci/2937/ipp/100/N/3802854960/pn1',
      "https://www.bhphotovideo.com/c/buy/Mirrorless-System-Lenses/ci/21265/ipp/100/N/4036297803/pn/1",
      "https://www.bhphotovideo.com/c/buy/Auxiliary-Lenses-Accessories/ci/6343/ipp/100/N/4036297801/pn/1",
      'https://www.bhphotovideo.com/c/buy/Pro-Prosumer-Camcorders/ci/15330/ipp/100/N/4294210518/pn/1'
    ];

    const allProducts = [];
    try {
      //NEW BROWSER
      const browser = await puppeteer.launch(
        {
          headless: true,
          args: ["--no-sandbox"]
        }
      );

      //NEW PAGE
      const page = await browser.newPage();

      //PAGE SETTINGS
      await Promise.all([
        page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36"),
        page.setRequestInterception(true),
        page.on('request', (request) => {
          if (['image', 'stylesheet', 'font', 'media'].indexOf(request.resourceType()) !== -1) {
            request.abort();
          } else {
            request.continue();
          }
        })
      ])

      for (const bhPage of pages) {

        try {
          const Page = bhPage.slice(0, -1);
          let i = 1
          let numberOfPages: any
          do {

            await page.goto(Page + i, { waitUntil: "networkidle2", timeout: 120000 });
            console.log(Page + i)

            const data = await page.evaluate(() => {

              //get pages number 
              const numberOfPagesSearch = document.querySelector('p[class="pageNuber"]').innerHTML
              const numberOfPagesSplit = numberOfPagesSearch.split('<span class="c3 eighteen">')
              const numberOgPagesFinal = numberOfPagesSplit[0].split('of')
              const numberOfPages = parseInt(numberOgPagesFinal[1].replace("Page", ""))

              //get the rest 
              const html = document.querySelectorAll("h5 a");
              const title = document.querySelectorAll('span[itemprop="name"]');
              const mfrId = document.querySelectorAll(
                'p[class="skus full-width c1 left"]'
              )
              const price = document.querySelectorAll(
                'span[class^="itc-you-pay-price"]'
              );
              const conditionSearch = document.querySelectorAll(
                'a[data-selenium="itemUsedCond"]'
              );

              const items = [];

              for (let o = 0; o < html.length; o++) {
                let newMfr;
                let condition = '';
                if (mfrId[o].innerHTML.includes("MFR")) {
                  const cleanMfr = mfrId[o].innerHTML.split("MFR # ");
                  newMfr = cleanMfr[1].replace('<span class="sku" data-selenium="sku">', "").replace('</span></span>\n', "")
                } else {
                  newMfr = "";
                }

                if (
                  conditionSearch[o].innerHTML.includes("6") === true ||
                  conditionSearch[o].innerHTML.includes("7") === true ||
                  conditionSearch[o].innerHTML.includes("8") === true
                ) {
                  condition = "USED";
                }

                if (
                  conditionSearch[o].innerHTML.includes("8+") === true ||
                  conditionSearch[o].innerHTML.includes("9") === true
                ) {
                  condition = "EXCELLENT";
                }

                if (
                  conditionSearch[o].innerHTML.includes("9+") === true ||
                  conditionSearch[o].innerHTML.includes("10") === true ||
                  conditionSearch[o].innerHTML.includes("OB") === true ||
                  conditionSearch[o].innerHTML.includes("DEMO") === true ||
                  conditionSearch[o].innerHTML.includes("Like new") === true ||
                  conditionSearch[o].innerHTML.includes("Refurbished") === true
                ) {
                  condition = "LIKENEW";
                }

                const element = {
                  html: html[o].getAttribute("href"),
                  title: title[o].innerHTML,
                  source: "B&H",
                  mfr_id: newMfr,
                  all_prices: [
                    {
                      source: "B&H",
                      condition: condition,
                      price: Math.ceil(parseFloat(price[o].innerHTML.replace("$", "").replace(",", "")))
                    }
                  ]
                };
                if (element.mfr_id != "") {
                  if (element.title.includes("with") != true) {
                    if (element.title.includes("Kit") === false) {
                      if (element.title.includes("Bundle") === false) {
                        if (element.all_prices[0].condition != '') {
                          if (element.all_prices[0].price != null) {
                            items.push(element);
                          }
                        }
                      }
                    }
                  }
                }
              }
              return { items, numberOfPages };
            });

            for (let p = 0; p < data.items.length; p++) {
              allProducts.push(data.items[p]);
            }

            console.log(allProducts.length);

            numberOfPages = data.numberOfPages

            i = i + 1
          } while (i <= numberOfPages)

        } catch (e) {
          throw new BadRequestException(e)
        }
      }
      await browser.close()
    } catch (e) {
      this.logger.error("Could not load First Page/Run Puppeter", e.stack);
    }
    return allProducts
  }
}