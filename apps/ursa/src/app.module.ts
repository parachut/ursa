import { DatabaseModule } from '@app/database/database.module';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { AddressModule } from './address/address.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    DatabaseModule,
    AddressModule,
    GraphQLModule.forRoot({
      installSubscriptionHandlers: false,
      autoSchemaFile: 'schema.gql',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
