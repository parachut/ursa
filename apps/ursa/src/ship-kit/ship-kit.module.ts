import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { ShipKitResolver } from './ship-kit.resolver';
import { ShipKitService } from './ship-kit.service';
import { ShipmentModule } from '../shipment/shipment.module';

@Module({
  imports: [ShipmentModule],
  providers: [ShipKitService, ShipKitResolver],
})
export class ShipKitModule {}
