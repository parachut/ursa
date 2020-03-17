import { PackerModule } from '@app/packer';
import { Module } from '@nestjs/common';

import { EmailModule } from '@app/email';
import { ShipmentModule } from '../shipment/shipment.module';
import { SlackModule } from '@app/slack';
import { ReturnService } from './return.service';

@Module({
  imports: [ShipmentModule, PackerModule, SlackModule, EmailModule],
  providers: [ReturnService],
  exports: [ReturnService],
})
export class ReturnModule {}
