import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { InventoryService } from '../inventory/inventory.service';

@Module({
  imports: [DatabaseModule],
  providers: [ShipmentService, InventoryService],
  exports: [ShipmentService],
})
export class ShipmentModule {}
