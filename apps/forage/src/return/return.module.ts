import { PackerModule } from '@app/packer';
import { Module } from '@nestjs/common';

import { EmailService } from '@app/email.';
import { ShipmentModule } from '../shipment/shipment.module';
import { SlackService } from '@app/slack';

@Module({
  imports: [ShipmentModule, PackerModule],
  providers: [EmailService, SlackService],
})
export class ReturnModule {}
