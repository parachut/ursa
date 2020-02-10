import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { CartItemService } from '../cart-item/cart-item.service';
import { CartResolver } from './cart.resolver';
import { CartService } from './cart.service';
import { RecurlyService } from '../recurly.service';
import { SlackService } from '../slack.service';
import { EmailService } from '../email.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    CartService,
    CartResolver,
    CartItemService,
    RecurlyService,
    SlackService,
    EmailService,
  ],
})
export class CartModule {}
