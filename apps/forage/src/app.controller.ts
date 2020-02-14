import { RecurlyService } from '@app/recurly';
import {
  Body,
  Controller,
  Post,
  Res,
  HttpStatus,
  Headers,
  Get,
} from '@nestjs/common';
import { Response } from 'express';

import { EasyPostHookDto } from './dto/easy-post-hook.dto';
import { ShipmentService } from './shipment/shipment.service';
import { InvoiceService } from './invoice/invoice.service';
import { InventoryService } from './inventory/inventory.service';
import { SubscriptionService } from './subscription/subscription.service';
import * as camelcaseKeysDeep from 'camelcase-keys-deep';

@Controller()
export class AppController {
  constructor(
    private readonly shipmentService: ShipmentService,
    private readonly recurlyService: RecurlyService,
    private readonly invoiceService: InvoiceService,
    private readonly inventoryService: InventoryService,
    private readonly subscriptionService: SubscriptionService,
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
}
