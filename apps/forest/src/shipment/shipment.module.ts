import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { ShipmentController } from './shipment.controller';

@Module({
  imports: [],
  controllers: [ShipmentController],
  providers: [ShipmentService],
})
export class ShipmentModule {}
