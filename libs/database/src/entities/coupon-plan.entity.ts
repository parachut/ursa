import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';

import { Coupon } from './coupon.entity';
import { Plan } from './plan.entity';

@Table({
  tableName: 'coupon_plans',
  underscored: true,
})
export class CouponPlan extends Model<CouponPlan> {
  @ForeignKey(() => Coupon)
  @Column
  couponId!: string;

  @ForeignKey(() => Plan)
  @Column
  planId!: string;
}
