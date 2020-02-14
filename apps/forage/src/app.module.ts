import { DatabaseModule } from '@app/database';
import { RecurlyService } from '@app/recurly';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

import { ShipmentModule } from './shipment/shipment.module';
import { InvoiceModule } from './invoice/invoice.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { UserModule } from './user/user.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    DatabaseModule,
    SubscriptionModule,
    InvoiceModule,
    ShipmentModule,
    InventoryModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [RecurlyService],
})
export class AppModule {}
