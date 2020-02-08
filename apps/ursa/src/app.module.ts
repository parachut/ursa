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
      autoSchemaFile: 'schema.gql',
      context: ({ req }) => ({ req }),
    }),
    CartModule,
    CartItemModule,
    CategoryModule,
    DepositModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmailService, PlaidService, DwollaService],
})
export class AppModule {}
