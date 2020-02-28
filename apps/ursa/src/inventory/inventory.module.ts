import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { InventoryResolver } from './inventory.resolver';
import { InventoryService } from './inventory.service';
import { CartService } from '../cart/cart.service';
import { ShipmentModule } from '../shipment/shipment.module';
import { EmailService } from '../email.service';
import { RecurlyService } from '../recurly.service';
import { SlackService } from '../slack.service';

@Module({
  imports: [ShipmentModule],
  providers: [
    InventoryService,
    InventoryResolver,
    CartService,
    EmailService,
    RecurlyService,
    SlackService,
  ],
})
export class InventoryModule {}
