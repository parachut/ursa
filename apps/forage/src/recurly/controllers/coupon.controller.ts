import { Body, Controller, Get, Post } from '@nestjs/common';

import { CouponService } from '../services/coupon.service';

@Controller()
export class CouponController {
  constructor(private readonly planService: CouponService) { }

  @Post('/coupon')
  findCoupon() {
    return this.planService.findCoupons();
  }

}
