import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { CartService } from '../cart/cart.service';
import { CartItemResolver } from './cart-item.resolver';
import { CartItemService } from './cart-item.service';

import { EmailService } from '../email.service';
import { RecurlyService } from '../recurly.service';
import { SlackService } from '../slack.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    CartItemService,
    CartItemResolver,
    CartService,
    EmailService,
    RecurlyService,
    EmailService,
    SlackService,
  ],
})
export class CartItemModule {}
