import { Module } from '@nestjs/common';
import { BPController } from './product.controller';
import { BPService } from './insert.service';
import { DatabaseModule } from '@app/database';
import * as Liana from 'forest-express-sequelize';
import { JwtStrategy } from '../jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [DatabaseModule, PassportModule,
    JwtModule.register({
      secret: process.env.FOREST_AUTH_SECRET,
      signOptions: { expiresIn: '7d' },
    }),],
  providers: [BPService, JwtStrategy],
  controllers: [BPController],
})
export class ProductModule {
  // constructor() {
  //   Liana.collection('Product', {
  //     actions: [
  //       {
  //         name: 'Insert Product',
  //         type: 'global',

  //         fields: [
  //           {
  //             field: 'url',
  //             type: 'String',
  //             isRequired: true,
  //             description: "Insert product url from B&H website."
  //           },
  //           {
  //             field: 'price',
  //             type: 'Number',
  //             description: "Insert price, if the price does not appear on the B&H page"
  //           },
  //         ],
  //       },
  //     ],
  //   });
  // }
}

