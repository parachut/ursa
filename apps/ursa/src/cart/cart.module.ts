import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';
import { CartItemService } from '../cart-item/cart-item.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  providers: [CartService, CartResolver, CartItemService],
})
export class CartModule {}
