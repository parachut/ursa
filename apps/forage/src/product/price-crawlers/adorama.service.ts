import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';

import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth/evasions/console.debug'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'
import randomUa from "random-ua"
puppeteer.use(RecaptchaPlugin({
  provider: {
    id: '2captcha',
    token: '361a9e7ad7e46174581317b02f1e7bc3' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
  },
  visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
})).use(StealthPlugin())

const pages = [
  "https://www.adorama.com/l/Used/Photography/Cameras?perPage=60",
];

const allPages = [
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=1&perPage=60',
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=61&perPage=60',
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=121&perPage=60',
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=181&perPage=60',
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=241&perPage=60',
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=301&perPage=60',
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=361&perPage=60',
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=421&perPage=60',
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=481&perPage=60',
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=541&perPage=60',
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=601&perPage=60',
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=601&perPage=60',
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=661&perPage=60',
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=721&perPage=60',
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=781&perPage=60',
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=841&perPage=60',
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=901&perPage=60',
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=961&perPage=60',
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=1021&perPage=60',
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=1081&perPage=60',
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=1141&perPage=60',
  'https://www.adorama.com/l/Used/Photography/Cameras?startAt=1201&perPage=60',
]
const distance = 800;
const delay = 2000;
@Injectable()
export class AdoramaService {
  private logger = new Logger('ValueService')

  constructor(@Inject('SEQUELIZE') private readonly sequelize) { }

  async insertValues() {
    const allProducts = [];
    try {

      for (const bhPage of pages) {


        const browser = await puppeteer.launch(
          { headless: false, defaultViewport: null, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', slowMo: 10, }
        );
        const page = await browser.newPage();

        async function getPages(bhPage, browser, page) {
          try {

            // console.log(randomUa.generate())
            await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36");
            await page.cookies('https://www.adorama.com/');

            await page.viewport({
              width: 1024 + Math.floor(Math.random() * 100),
              height: 768 + Math.floor(Math.random() * 100),
            })
            await page.addScriptTag({
              url: "https://code.jquery.com/jquery-3.2.1.min.js"
            });
            await page.setRequestInterception(true);
            page.on('request', (request) => {
              if (['image', 'stylesheet', 'font', 'svg'].indexOf(request.resourceType()) !== -1) {
                request.abort();
              } else {
                request.continue();
              }
            });
            await page.solveRecaptchas()
            await page.waitFor(2000)

            await page.goto(bhPage, { waitUntil: "networkidle2", timeout: 120000 });


            const numberOfPages = await page.evaluate(() => {

              const numberOfPages = document.querySelector('span[class="max-pagination-page"]').innerHTML

              return numberOfPages
            })



            console.log(numberOfPages)
            async function oneCategory(numberOfPages, browser, page, bhPage) {
              try {
                for (let q = 1; q <= numberOfPages; q++) {
                  //      await page.setUserAgent('5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
                  await page.setUserAgent(randomUa.generate());
                  const cookies = await page.cookies('https://www.adorama.com/');
                  await page.cookies('https://www.adorama.com/');

                  await page.viewport({
                    width: 1024 + Math.floor(Math.random() * 100),
                    height: 768 + Math.floor(Math.random() * 100),
                  })

                  await page.goto(allPages[q], { waitUntil: "networkidle2", timeout: 120000 });
                  await page.addScriptTag({
                    url: "https://code.jquery.com/jquery-3.2.1.min.js"
                  });

                  let linksFromEachPage
                  function extractItems() {
                    const extractedElements = document.querySelectorAll("h2 a");

                    const items = [];
                    for (const element of extractedElements) {
                      const id = element.getAttribute("href");
                      items.push(id);
                    }
                    return items;
                  }
                  while (
                    await page.evaluate(
                      () =>
                        document.scrollingElement.scrollTop + window.innerHeight <
                        document.scrollingElement.scrollHeight
                    )
                  ) {
                    linksFromEachPage = await page.evaluate(extractItems);

                    await page.evaluate(y => {
                      document.scrollingElement.scrollBy(0, y);
                    }, distance);
                    await page.waitFor(delay);
                  }

                  console.log(linksFromEachPage)

                }
              } catch (e) {
                throw new BadRequestException(e)
              }
              // await browser.close()
            }
            await oneCategory(numberOfPages, browser, page, bhPage);

          } catch (e) {
            throw new BadRequestException(e)
          }
        }
        await getPages(bhPage, browser, page)
      }
    } catch (e) {
      this.logger.error("Could not load First Page/ Run Puppeter", e.stack);
    }

    return allProducts
  }


}