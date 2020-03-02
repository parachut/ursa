import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { CartItemService } from '../cart-item/cart-item.service';
import { EmailService } from '../email.service';
import { RecurlyModule } from '@app/recurly';
import { SlackService } from '../slack.service';
import { CartResolver } from './cart.resolver';
import { CartService } from './cart.service';

@Module({
  imports: [RecurlyModule],
  providers: [
    CartService,
    CartResolver,
    CartItemService,
    EmailService,
    SlackService,
  ],
  exports: [CartService],
})
export class CartModule {}
