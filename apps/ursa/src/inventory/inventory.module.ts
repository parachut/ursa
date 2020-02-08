import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { InventoryResolver } from './inventory.resolver';
import { InventoryService } from './inventory.service';

@Module({
  imports: [DatabaseModule],
  providers: [InventoryService, InventoryResolver],
})
export class InventoryModule {}
