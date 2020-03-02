import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { InventoryResolver } from './inventory.resolver';
import { InventoryService } from './inventory.service';
import { CartModule } from '../cart/cart.module';
import { ShipmentModule } from '../shipment/shipment.module';

@Module({
  imports: [ShipmentModule, CartModule],
  providers: [InventoryService, InventoryResolver],
})
export class InventoryModule {}
