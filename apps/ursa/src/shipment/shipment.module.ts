import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { ShipmentResolver } from './shipment.resolver';
import { ShipmentService } from './shipment.service';

@Module({
  imports: [DatabaseModule],
  providers: [ShipmentService, ShipmentResolver],
})
export class ShipmentModule {}
