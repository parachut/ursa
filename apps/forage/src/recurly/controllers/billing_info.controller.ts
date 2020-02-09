import { Body, Controller, Get, Post } from '@nestjs/common';

import { BillingService } from '../services/billing_info.service';

@Controller()
export class BillingController {
  constructor(private readonly planService: BillingService) { }

  @Post('/billing_info')
  findBilling() {
    return this.planService.findBilling();
  }

}
