import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module';
import { PlanController } from '../controllers/plan.controller';
import { PlanService } from '../services/plan.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [PlanService],
  controllers: [PlanController],
})
export class PlanModule {}
