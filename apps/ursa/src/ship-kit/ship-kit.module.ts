import { Module } from '@nestjs/common';
import { PackerModule } from '@app/packer';

import { ShipKitResolver } from './ship-kit.resolver';
import { ShipKitService } from './ship-kit.service';
import { ShipmentModule } from '../shipment/shipment.module';
import { EmailService } from '../email.service';
import { SlackService } from '../slack.service';

@Module({
  imports: [ShipmentModule, PackerModule],
  providers: [ShipKitService, ShipKitResolver, EmailService, SlackService],
  exports: [ShipKitService],
})
export class ShipKitModule {}
