import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { AddressModule } from './address/address.module';
import { AuthModule } from './auth/auth.module';
import { BankAccountModule } from './bank-account/bank-account.module';
import { EmailService } from './email.service';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlaidService } from './plaid.service';
import { DwollaService } from './dwolla.service';
import { CartModule } from './cart/cart.module';
import { CartItemModule } from './cart-item/cart-item.module';
import { CategoryModule } from './category/category.module';
import { DepositModule } from './deposit/deposit.module';
import { InventoryModule } from './inventory/inventory.module';
import { ProductModule } from './product/product.module';
import { ElasticService } from './elastic.service';
import { QueueModule } from './queue/queue.module';
import { ShipKitModule } from './ship-kit/ship-kit.module';
import { ShipmentModule } from './shipment/shipment.module';
import { RecurlyService } from './recurly.service';
import { SlackService } from './slack.service';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    AddressModule,
    BankAccountModule,
    GraphQLModule.forRoot({
      debug: true,
      installSubscriptionHandlers: false,
      autoSchemaFile: true,
      context: ({ req }) => ({ req }),
    }),
    CartModule,
    CartItemModule,
    CategoryModule,
    DepositModule,
    InventoryModule,
    ProductModule,
    QueueModule,
    ShipKitModule,
    ShipmentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EmailService,
    PlaidService,
    DwollaService,
    ElasticService,
    RecurlyService,
    SlackService,
  ],
})
export class AppModule {}
