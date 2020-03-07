import { Logger, Injectable, Inject } from '@nestjs/common';
import { Coupon, CouponPlan } from '@app/database/entities';
import { RecurlyService } from '@app/recurly';
import to from 'await-to-js';
import { omit, pick } from 'lodash';

@Injectable()
export class CouponService {
  private logger = new Logger(CouponService.name);

  private readonly couponRepository: typeof Coupon = this.sequelize.getRepository(
    'Coupon',
  );

  private readonly couponPlansRepository: typeof CouponPlan = this.sequelize.getRepository(
    'CouponPlan',
  );

  private readonly filterKeys = [
    'appliesToAllPlans',
    'appliesToNonPlanCharges',
    'couponType',
    'code',
    'discount',
    'duration',
    'freeTrialAmount',
    'freeTrialUnit',
    'invoiceDescription',
    'maxRedemptions',
    'name',
    'object',
    'state',
    'temporalAmount',
    'temporalUnit',
    'uniqueCodeTemplate',
    'uniqueCouponCodesCount',
    'createdAt',
    'expiredAt',
    'redeemBy',
  ];

  constructor(
    @Inject('SEQUELIZE') private readonly sequelize,
    private readonly recurlyService: RecurlyService,
  ) {}

  async createOrUpdateCoupon(couponId: string) {
    const recurlyCoupon = await this.recurlyService.getCoupon(couponId);

    const dbCoupon: any = {
      ...pick(recurlyCoupon, this.filterKeys),
    };

    const [err, record] = await to(
      this.couponRepository.update(omit(dbCoupon, ['id']), {
        where: {
          id: couponId,
        },
      }),
    );

    if (err || !record[0]) {
      await this.couponRepository.create(dbCoupon);
    }
  }
}
