import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { CartItemService } from '../cart-item/cart-item.service';
import { EmailService } from '../email.service';
import { RecurlyService } from '../recurly.service';
import { SlackService } from '../slack.service';
import { CartResolver } from './cart.resolver';
import { CartService } from './cart.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    CartService,
    CartResolver,
    CartItemService,
    EmailService,
    RecurlyService,
    SlackService,
  ],
})
export class CartModule {}
