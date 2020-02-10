import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CouponService } from '../services/coupon.service';

@Controller()
export class CouponController {
  constructor(private readonly planService: CouponService) { }
  @UseGuards(AuthGuard('local'))
  @Post('/coupon')
  findCoupon() {
    return this.planService.findCoupons();
  }

}
