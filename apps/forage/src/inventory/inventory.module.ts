import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Module({
  imports: [DatabaseModule],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
