import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import * as Liana from 'forest-express-sequelize';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {
  constructor() {
    Liana.collection('Cart', {
      actions: [
        {
          name: 'Confirm cart',
        },
        {
          name: 'Cancel cart',
        },
        {
          name: 'Export history',
          type: 'global',
          download: true,
        },
      ],
    });
  }
}
