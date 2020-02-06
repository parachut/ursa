import { Injectable, Inject } from '@nestjs/common';
import { Coupon } from '@app/database/entities';
import * as Recurly from "recurly";
const recurly = new Recurly.Client(process.env.RECURLY);

@Injectable()
export class CouponService {
  private readonly CouponRepository: typeof Coupon = this.sequelize.getRepository(
    'Coupon',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  async findCoupons(): Promise<Coupon[]> {
    const coupons = await this.CouponRepository.findAll({});
    return coupons;
  }


}
