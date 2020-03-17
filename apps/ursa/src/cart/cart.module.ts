import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { CartItemService } from '../cart-item/cart-item.service';
import { EmailModule } from '@app/email';
import { RecurlyModule } from '@app/recurly';
import { SlackModule } from '@app/slack';
import { CartResolver } from './cart.resolver';
import { CartService } from './cart.service';

@Module({
  imports: [RecurlyModule, SlackModule, EmailModule],
  providers: [CartService, CartResolver, CartItemService],
  exports: [CartService],
})
export class CartModule {}
