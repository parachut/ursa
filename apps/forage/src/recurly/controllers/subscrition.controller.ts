import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionService } from '../services/subscrition.service';

@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) { }
  @UseGuards(AuthGuard('local'))
  @Post('/subscription')
  findSubscriptions(@Body() body) {
    return this.subscriptionService.findSubscriptions("uuid-" + body.new_subscription_notification.subscription[0].uuid);
  }
}
