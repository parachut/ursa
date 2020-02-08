import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { InventoryResolver } from './inventory.resolver';
import { InventoryService } from './inventory.service';
import { CartService } from '../cart/cart.service';
import { ShipmentService } from '../shipment/shipment.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    InventoryService,
    InventoryResolver,
    CartService,
    ShipmentService,
  ],
})
export class InventoryModule {}
