import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { AddressModule } from './address/address.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AddressModule,
    AuthModule,
    GraphQLModule.forRoot({
      debug: true,
      installSubscriptionHandlers: false,
      autoSchemaFile: 'schema.gql',
      context: ({ req }) => ({ req }),
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
