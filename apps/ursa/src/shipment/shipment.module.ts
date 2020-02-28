import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { EasyPostModule } from '@app/easypost';

import { ShipmentResolver } from './shipment.resolver';
import { ShipmentService } from './shipment.service';

@Module({
  imports: [EasyPostModule],
  providers: [ShipmentService, ShipmentResolver],
  exports: [ShipmentService],
})
export class ShipmentModule {}
