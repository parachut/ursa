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
import { ShipmentModule } from './shipment/shipment.module';
import { InventoryModule } from './plan/inventory/inventory.module';
import { PlanModule } from './plan/plan.module';
import { BillingInfoModule } from './billing-info/billing-info.module';
import { InvoiceModule } from './invoice/invoice.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    SubscriptionModule,
    EasypostModule,
    PlanModule,
    CouponModule,
    BillingModule,
    InvoiceModule,
    EasypostModule,
    ShipmentModule,
    InventoryModule,
    BillingInfoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
