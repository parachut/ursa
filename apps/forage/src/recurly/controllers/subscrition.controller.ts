import { Body, Controller, Get, Post } from '@nestjs/common';

import { SubscriptionService } from '../services/subscrition.service';

@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) { }

  @Get('/subscription')
  findSubscriptions() {
    return this.subscriptionService.findSubscriptions();
  }



  @Post('/subscription')
  getPost(@Body() body: any): string {
    return body;
  }


}
