import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubscriptionModule } from './recurly/modules/subscrition.module';
import { PlanModule } from './recurly/modules/plan.module';
import { EasypostModule } from './easypost/easypost.module';

@Module({
  imports: [SubscriptionModule, EasypostModule, PlanModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
