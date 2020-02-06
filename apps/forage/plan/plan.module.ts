import { Module } from '@nestjs/common';
import { PlanService } from './plan.service';
//import { DatabaseModule } from '@app/database/database.module';
import { PlanController } from './plan.controller';
@Module({
 
  controllers: [PlanController],
  providers: [PlanService],
})
export class PlanModule { }
