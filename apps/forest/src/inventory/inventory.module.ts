import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './invetory.service';
import { CalculatorService } from '@app/calculator';
@Module({
  imports: [DatabaseModule],
  controllers: [InventoryController],
  providers: [InventoryService, CalculatorService]
  ,
})
export class InventoryModule { }
