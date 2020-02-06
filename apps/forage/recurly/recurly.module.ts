import { Module } from '@nestjs/common';
import { RecurlyController } from './recurly.controller';
import { RecurlyService } from './recurly.service';
//import { DatabaseModule } from '@app/database/database.module';
import { PlanModule } from '../plan/plan.module';
@Module({
  imports: [PlanModule],
  controllers: [RecurlyController],
  providers: [RecurlyService],
})
export class RecurlyModule { }
