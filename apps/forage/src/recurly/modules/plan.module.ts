import { Module } from '@nestjs/common';
import { PlanController } from '../controllers/plan.controller';
import { PlanService } from '../services/plan.service';
import { DatabaseModule } from '@app/database';
@Module({
  imports: [DatabaseModule],
  providers: [PlanService],
  controllers: [PlanController],
})
export class PlanModule { }

