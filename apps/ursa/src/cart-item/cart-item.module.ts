import { Module } from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { CartItemResolver } from './cart-item.resolver';
import { CartService } from '../cart/cart.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  providers: [CartItemService, CartItemResolver, CartService],
})
export class CartItemModule {}
