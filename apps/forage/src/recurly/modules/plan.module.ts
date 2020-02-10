import { Module } from '@nestjs/common';
import { PlanController } from '../controllers/plan.controller';
import { PlanService } from '../services/plan.service';
import { DatabaseModule } from '@app/database';
import { AuthModule } from '..//../auth/auth.module';
@Module({
  imports: [DatabaseModule,AuthModule],
  providers: [PlanService],
  controllers: [PlanController],
})
export class PlanModule { }

