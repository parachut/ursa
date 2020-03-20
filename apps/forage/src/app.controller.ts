import { RecurlyService } from '@app/recurly';
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import camelcaseKeysDeep from 'camelcase-keys-deep';
import { Request, Response } from 'express';

import { EasyPostHookDto } from './dto/easy-post-hook.dto';
import { TrackerDto } from './dto/tracker.dto';
import { InventoryService } from './inventory/inventory.service';
import { InvoiceService } from './invoice/invoice.service';
import { ShipmentService } from './shipment/shipment.service';
import { SubscriptionService } from './subscription/subscription.service';
import { VisitService } from './visit/visit.service';
import { IpAddress } from './ip-address.decorator';

//CRAWLERS PRICES
import { KEHService } from './product/price-crawlers/keh.service'
import { BestBuyService } from './product/price-crawlers/bestbuy.service'
import { MPBService } from './product/price-crawlers/mpb.service'
import { BHService } from './product/price-crawlers/b&h.service'
import { InsertValueService } from './product/insert-values.service'
import { Daily500pxService } from './product//social-crawlers/500px.service';
@Controller()
export class AppController {
  constructor(
    private readonly shipmentService: ShipmentService,
    private readonly recurlyService: RecurlyService,
    private readonly invoiceService: InvoiceService,
    private readonly inventoryService: InventoryService,
    private readonly subscriptionService: SubscriptionService,
    private readonly visitService: VisitService,

    //CRAWLERS SERVICES
    private readonly kehService: KEHService,
    private readonly bhService: BHService,
    private readonly bestbuyService: BestBuyService,
    private readonly mpbService: MPBService,
    private readonly insertValueService: InsertValueService,
    private readonly social500pxService: Daily500pxService,


  ) { }

  @Post('/easypost')
  async easyPost(
    @Body() easyPostHookDto: EasyPostHookDto,
    @Res() res: Response,
  ) {
    const easyPostId = easyPostHookDto?.result?.shipment_id;

    if (!easyPostId) {
      return 'No shipmentId found.';
    }

    if (easyPostHookDto.description === 'tracker.updated') {
      await this.shipmentService.trackerUpdated(easyPostId);
    }

    return res.status(HttpStatus.OK).send();
  }

  @Post('/recurly')
  async recurly(@Body() body: object, @Res() res: Response) {
    const camalBody = camelcaseKeysDeep(body);

    if (this.recurlyService.xmlDecision('invoice', body)) {
      await this.invoiceService.updateOrCreate(camalBody);
    }

    if (this.recurlyService.xmlDecision('subscription', body)) {
      await this.subscriptionService.updateOrCreate(camalBody);
    }

    return res.status(HttpStatus.OK).send();
  }

  @Get('/hourly-commission')
  async hourlyCommission(
    @Res() res: Response,
    @Headers('x-appengine-cron') cron: string,
  ) {
    if (cron !== 'true') {
      return res.status(401).end();
    }

    const hour = new Date().getHours();

    await this.inventoryService.payCommission(hour);

    return res.status(HttpStatus.OK).send();
  }

  @Post('/tracker')
  async tracker(
    @Body() { deviceId, affiliateId, marketingSource }: TrackerDto,
    @IpAddress() ipAddress: string,
    @Res()
    res: Response,
    @Req() req: Request,
  ) {
    const visitorId = req.cookies.parac_uid;

    const visit = await this.visitService.recordVisit({
      visitorId,
      deviceId,
      ipAddress,
      req,
      affiliateId,
      marketingSource,
    });

    return res.status(HttpStatus.OK).send({
      id: visit.id,
    });
  }


  @Post('/keh')
  async pricesKEHCrawl(
    @Res() res: Response,
    //  @Headers('x-appengine-cron') cron: string,
  ) {
    // if (cron !== 'true') {
    //   return res.status(401).end();
    // }

    const products = await this.kehService.insertValues()
    console.log(products.length)

    if (products.length != 0) {
      await this.insertValueService.insertValues(products)
    }
    return res.status(HttpStatus.OK).send();
  }

  @Post('/mpb')
  async pricesMPBCrawl(
    @Res() res: Response,
    //  @Headers('x-appengine-cron') cron: string,
  ) {
    // if (cron !== 'true') {
    //   return res.status(401).end();
    // }

    const products = await this.mpbService.insertValues()
    console.log(products.length)

    if (products.length != 0) {
      await this.insertValueService.insertValues(products)
    }

    return res.status(HttpStatus.OK).send();
  }

  @Post('/bh')
  async pricesBHCrawl(
    @Res() res: Response,
    // @Headers('x-appengine-cron') cron: string,
  ) {
    // if (cron !== 'true') {
    //   return res.status(401).end();
    // }

    const products = await this.bhService.insertValues()
    console.log(products.length)
    if (products.length != 0) {
      await this.insertValueService.insertValues(products)
    }

    return res.status(HttpStatus.OK).send();
  }

  @Post('/bestbuy')
  async pricesCrawl(
    @Res() res: Response,
    // @Headers('x-appengine-cron') cron: string,
  ) {
    // if (cron !== 'true') {
    //   return res.status(401).end();
    // }

    const products = await this.bestbuyService.insertValues()

    console.log(products.length)
    if (products.length != 0) {
      await this.insertValueService.insertValues(products)
    }
    return res.status(HttpStatus.OK).send();
  }

  @Post('/500px')
  async social50pxCrawl(
    @Res() res: Response,
    // @Headers('x-appengine-cron') cron: string,
  ) {
    // if (cron !== 'true') {
    //   return res.status(401).end();
    // }

    const products = await this.social500pxService.daily500px()


    return res.status(HttpStatus.OK).send();
  }

}
