import { Body, Controller, Get, Post } from '@nestjs/common';

import { SubscriptionService } from '../services/subscrition.service';

@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) { }

  @Post('/subscription')
  findSubscriptions(@Body() body) {
    return this.subscriptionService.findSubscriptions("uuid-" + body.new_subscription_notification.subscription[0].uuid);
  }
}
