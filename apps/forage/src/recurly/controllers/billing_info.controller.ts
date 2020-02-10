import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BillingService } from '../services/billing_info.service';

@Controller()
export class BillingController {
  constructor(private readonly planService: BillingService) { }
  @UseGuards(AuthGuard('local'))
  @Post('/billing_info')
  findBilling() {
    return this.planService.findBilling();
  }

}
