import { Injectable, Inject, Logger } from '@nestjs/common';
import { Coupon, CouponPlan } from '@app/database/entities';
import Recurly from 'recurly';
const recurly = new Recurly.Client(process.env.RECURLY);

@Injectable()
export class CouponService {
  private logger = new Logger('CouponService');
  private readonly CouponRepository: typeof Coupon = this.sequelize.getRepository(
    'Coupon',
  );

  private readonly CouponPlansRepository: typeof CouponPlan = this.sequelize.getRepository(
    'CouponPlan',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  async findCoupons(): Promise<Coupon[]> {
    try {
      const couponsRecurly = recurly.listCoupons({ limit: 200 });

      for await (const coupon of couponsRecurly.each()) {
        try {
          await this.CouponRepository.update(
            {
              appliesToAllPlans: coupon.appliesToAllPlans || false,
              appliesToNonPlanCharges: coupon.appliesToNonPlanCharges || false,
              couponType: coupon.couponType || '',
              discount: JSON.stringify({
                currencies:
                  coupon.discount?.currencies?.map(c => ({
                    amount: c.amount || 0,
                    currency: c.currency || '',
                  })) || undefined,
                percent: coupon.discount?.percent || 0,
                trial: {
                  length: coupon.discount?.trial?.length || 0,
                  unit: coupon.discount?.trial?.unit || '',
                },
                type: coupon.discount?.type || '',
              }),
              code: coupon.code || '',
              duration: coupon.duration || '',
              freeTrialAmount: coupon.freeTrialAmount || 0,
              freeTrialUnit: coupon.freeTrialUnit || '',
              invoiceDescription: coupon.invoiceDescription || '',
              maxRedemptions: coupon.maxRedemptions || 0,
              maxRedemptionsPerAccount: coupon.maxRedemptionsPerAccount || 0,
              name: coupon.name || '',
              object: coupon.object || '',
              state: coupon.state || '',
              temporalAmount: coupon.temporalAmount || 0,
              temporalUnit: coupon.temporalUnit || '',
              uniqueCodeTemplate: coupon.uniqueCodeTemplate || '',
              uniqueCouponCodesCount: coupon.uniqueCouponCodesCount || 0,
              createdAt: coupon.createdAt || new Date(),
              expiredAt: coupon.expiredAt || new Date(),
              redeemBy: coupon.redeemBy || new Date(),
            },
            { where: { id: coupon.id } },
          ).then(async record => {
            if (record[0] === 0) {
              await this.CouponRepository.create({
                id: coupon.id,
                appliesToAllPlans: coupon.appliesToAllPlans || false,
                appliesToNonPlanCharges:
                  coupon.appliesToNonPlanCharges || false,
                couponType: coupon.couponType || '',
                discount: JSON.stringify({
                  currencies:
                    coupon.discount?.currencies?.map(c => ({
                      amount: c.amount || 0,
                      currency: c.currency || '',
                    })) || undefined,
                  percent: coupon.discount?.percent || 0,
                  trial: {
                    length: coupon.discount?.trial?.length || 0,
                    unit: coupon.discount?.trial?.unit || '',
                  },
                  type: coupon.discount?.type || '',
                }),
                code: coupon.code || '',
                duration: coupon.duration || '',
                freeTrialAmount: coupon.freeTrialAmount || 0,
                freeTrialUnit: coupon.freeTrialUnit || '',
                invoiceDescription: coupon.invoiceDescription || '',
                maxRedemptions: coupon.maxRedemptions || 0,
                maxRedemptionsPerAccount: coupon.maxRedemptionsPerAccount || 0,
                name: coupon.name || '',
                object: coupon.object || '',
                state: coupon.state || '',
                temporalAmount: coupon.temporalAmount || 0,
                temporalUnit: coupon.temporalUnit || '',
                uniqueCodeTemplate: coupon.uniqueCodeTemplate || '',
                uniqueCouponCodesCount: coupon.uniqueCouponCodesCount || 0,
                createdAt: coupon.createdAt || new Date(),
                expiredAt: coupon.expiredAt || new Date(),
                redeemBy: coupon.redeemBy || new Date(),
                updatedAt: coupon.updatedAt,
              }).then(async newRecord => {
                console.log('New Coupon', newRecord.id);
              });
              if (coupon.plans != null && coupon.plans?.length != 0) {
                coupon.plans.forEach(async element => {
                  await this.CouponPlansRepository.create({
                    couponId: coupon.id,
                    planId: element.id,
                    createdAt: coupon.createdAt,
                    updatedAt: coupon.updatedAt,
                  }).then(async newRecord => {
                    console.log('New Plan Coupon', newRecord);
                  });
                  console.log('Created - Coupon plans');
                });
              }

              console.log('Inserted');
            } else {
              if (coupon.plans != null && coupon.plans?.length != 0) {
                coupon.plans.forEach(async element => {
                  await this.CouponPlansRepository.update(
                    {
                      planId: element.id,
                      createdAt: coupon.createdAt,
                      updatedAt: coupon.updatedAt,
                    },
                    { where: { couponId: coupon.id, planId: element.id } },
                  ).then(async record => {
                    if (record[0] === 0) {
                      coupon.plans.forEach(async element => {
                        await this.CouponPlansRepository.create({
                          couponId: coupon.id,
                          planId: element.id,
                          createdAt: coupon.createdAt,
                          updatedAt: coupon.updatedAt,
                        }).then(async newRecord => {
                          console.log('New Plan Coupon', newRecord);
                        });
                        console.log('Created - Coupon plans');
                      });
                    } else {
                      console.log('Updated - Coupon plans');
                    }
                  });
                });
              }
              console.log('Updated');
            }
          });
        } catch (e) {
          console.log(e.message);
          this.logger.error(
            `Failed with Inserting to DB (SEQUELIZE) `,
            e.stack,
          );
        }
      }
    } catch (e) {
      console.log(e.message);
      this.logger.error(`Failed with Recurly (listCoupons)`, e.stack);
    }
    this.logger.log(`Subscription Updated`);
    return;
  }
}
