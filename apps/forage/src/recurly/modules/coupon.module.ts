import { Module } from '@nestjs/common';
import { CouponController } from '../controllers/coupon.controller';
import { CouponService } from '../services/coupon.service';
import { DatabaseModule } from '@app/database';
import { AuthModule } from '..//../auth/auth.module';
@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [CouponService],
  controllers: [CouponController],
})
export class CouponModule { }

