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

@Controller()
export class AppController {
  constructor(
    private readonly shipmentService: ShipmentService,
    private readonly recurlyService: RecurlyService,
    private readonly invoiceService: InvoiceService,
    private readonly inventoryService: InventoryService,
    private readonly subscriptionService: SubscriptionService,
    private readonly visitService: VisitService,
  ) {}

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
    @Body() { visitorId, deviceId, affiliateId, marketingSource }: TrackerDto,
    @IpAddress() ipAddress: string,
    @Res()
    res: Response,
    @Req() req: Request,
  ) {
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
}
