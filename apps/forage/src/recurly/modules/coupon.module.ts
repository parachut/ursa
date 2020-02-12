import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module';
import { CouponController } from '../controllers/coupon.controller';
import { CouponService } from '../services/coupon.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [CouponService],
  controllers: [CouponController],
})
export class CouponModule {}
