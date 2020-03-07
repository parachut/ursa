import { RecurlyModule } from '@app/recurly';
import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';

@Module({
  imports: [RecurlyModule],
  providers: [CouponService],
  exports: [CouponService],
})
export class CouponModule {}
