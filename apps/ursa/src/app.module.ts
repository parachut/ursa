import { DatabaseModule } from '@app/database';
import { RecurlyModule } from '@app/recurly';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { AddressModule } from './address/address.module';
import { AffiliateLinkModule } from './affiliate-link/affiliate-link.module';
import { AuthModule } from './auth/auth.module';
import { BankAccountModule } from './bank-account/bank-account.module';
import { CartItemModule } from './cart-item/cart-item.module';
import { CartModule } from './cart/cart.module';
import { CategoryModule } from './category/category.module';
import { DepositModule } from './deposit/deposit.module';
import { InventoryModule } from './inventory/inventory.module';
import { ProductModule } from './product/product.module';
import { pubSubProvider } from './pubsub.provider';
import { QueueModule } from './queue/queue.module';
import { ReturnModule } from './return/return.module';
import { ShipKitModule } from './ship-kit/ship-kit.module';
import { ShipmentModule } from './shipment/shipment.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    AddressModule,
    BankAccountModule,
    CartModule,
    CartItemModule,
    CategoryModule,
    DepositModule,
    InventoryModule,
    ProductModule,
    QueueModule,
    ShipKitModule,
    ShipmentModule,
    RecurlyModule,
    AffiliateLinkModule,
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: true,
      context: ({ req, connection }) =>
        connection ? { req: connection.context } : { req },
    }),
    ReturnModule,
  ],
  controllers: [],
  providers: [pubSubProvider],
})
export class AppModule {}
