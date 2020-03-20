import { Module } from '@nestjs/common';
import { PackerModule } from '@app/packer';

import { ShipKitResolver } from './ship-kit.resolver';
import { ShipKitService } from './ship-kit.service';
import { ShipmentModule } from '../shipment/shipment.module';
import { EmailModule } from '@app/email';
import { SlackModule } from '@app/slack';

@Module({
  imports: [ShipmentModule, PackerModule, EmailModule, SlackModule],
  providers: [ShipKitService, ShipKitResolver],
  exports: [ShipKitService],
})
export class ShipKitModule {}
