import { DatabaseModule } from '@app/database';
import { RecurlyService } from '@app/recurly';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

import { ShipmentModule } from './shipment/shipment.module';
import { ProductModule } from './product/product.module';
import { InvoiceModule } from './invoice/invoice.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { UserModule } from './user/user.module';
import { InventoryModule } from './inventory/inventory.module';
import { VisitModule } from './visit/visit.module';
import { AddOnModule } from './add-on/add-on.module';
import { CouponModule } from './coupon/coupon.module';
import { ReturnModule } from './return/return.module';

@Module({
  imports: [
    DatabaseModule,
    SubscriptionModule,
    InvoiceModule,
    ShipmentModule,
    InventoryModule,
    UserModule,
    VisitModule,
    AddOnModule,
    CouponModule,
    ProductModule,
    ReturnModule,
  ],
  controllers: [AppController],
  providers: [RecurlyService],
})
export class AppModule {}
