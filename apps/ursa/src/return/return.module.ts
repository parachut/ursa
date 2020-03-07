import { PackerModule } from '@app/packer';
import { Module } from '@nestjs/common';

import { EmailService } from '../email.service';
import { ShipmentModule } from '../shipment/shipment.module';
import { SlackService } from '../slack.service';
import { ReturnService } from './return.service';
import { ReturnResolver } from './return.resolver';

@Module({
  imports: [ShipmentModule, PackerModule],
  providers: [ReturnService, ReturnResolver, EmailService, SlackService],
  exports: [ReturnService],
})
export class ReturnModule {}
