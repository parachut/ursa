import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { CartService } from '../cart/cart.service';
import { CartItemResolver } from './cart-item.resolver';
import { CartItemService } from './cart-item.service';

@Module({
  imports: [DatabaseModule],
  providers: [CartItemService, CartItemResolver, CartService],
})
export class CartItemModule {}
