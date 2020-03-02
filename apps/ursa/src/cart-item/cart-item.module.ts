import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { CartModule } from '../cart/cart.module';
import { CartItemResolver } from './cart-item.resolver';
import { CartItemService } from './cart-item.service';

@Module({
  imports: [DatabaseModule, CartModule],
  providers: [CartItemService, CartItemResolver],
})
export class CartItemModule {}
