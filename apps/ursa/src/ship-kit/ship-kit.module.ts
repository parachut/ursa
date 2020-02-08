import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { ShipKitResolver } from './ship-kit.resolver';
import { ShipKitService } from './ship-kit.service';

@Module({
  imports: [DatabaseModule],
  providers: [ShipKitService, ShipKitResolver],
})
export class ShipKitModule {}
