import { DatabaseModule } from '@app/database';
import { EasyPostModule } from '@app/easypost';
import { Module } from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { ShipmentController } from './shipment.controller';

@Module({
  imports: [DatabaseModule, EasyPostModule],
  controllers: [ShipmentController],
  providers: [ShipmentService],
})
export class ShipmentModule {}
