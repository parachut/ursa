import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubscriptionModule } from './recurly/modules/subscrition.module';
import { PlanModule } from './recurly/modules/plan.module';

import { CouponModule } from './recurly/modules/coupon.module';
import { BillingModule } from './recurly/modules/billing_info.module';
import { InvoiceModule } from './recurly/modules/invoice.module';
//import { BPModule } from './recurly/modules/bp.module';

import { EasypostModule } from './easypost/easypost.module';


@Module({
  imports: [SubscriptionModule, EasypostModule, PlanModule, CouponModule, BillingModule, InvoiceModule, EasypostModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
