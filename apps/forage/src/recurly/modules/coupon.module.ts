import { Module } from '@nestjs/common';
import { CouponController } from '../controllers/coupon.controller';
import { CouponService } from '../services/coupon.service';
import { DatabaseModule } from '@app/database';
@Module({
  imports: [DatabaseModule],
  providers: [CouponService],
  controllers: [CouponController],
})
export class CouponModule { }

