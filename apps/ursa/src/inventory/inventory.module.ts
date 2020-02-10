import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { InventoryResolver } from './inventory.resolver';
import { InventoryService } from './inventory.service';
import { CartService } from '../cart/cart.service';
import { ShipmentService } from '../shipment/shipment.service';
import { EmailService } from '../email.service';
import { RecurlyService } from '../recurly.service';
import { SlackService } from '../slack.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    InventoryService,
    InventoryResolver,
    CartService,
    ShipmentService,
    EmailService,
    RecurlyService,
    SlackService,
  ],
})
export class InventoryModule {}
