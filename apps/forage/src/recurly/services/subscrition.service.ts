import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  Subscription,
  SubscriptionAddOn,
  CouponRedemption,
} from '@app/database/entities';
import Recurly from 'recurly';
const recurly = new Recurly.Client(process.env.RECURLY);

@Injectable()
export class SubscriptionService {
  private logger = new Logger('SubscriptionService');
  private readonly subscriptionRepository: typeof Subscription = this.sequelize.getRepository(
    'Subscription',
  );
  private readonly subscriptionAddOnRepository: typeof SubscriptionAddOn = this.sequelize.getRepository(
    'SubscriptionAddOn',
  );
  private readonly subscriptionCouponRedemptionRepository: typeof CouponRedemption = this.sequelize.getRepository(
    'CouponRedemption',
  );
  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  async findSubscriptions(subId: string): Promise<Subscription[]> {
    try {
      const subscription = await recurly.getSubscription(subId);
      try {
        if (subscription.account && subscription.account.id) {
          await this.subscriptionRepository
            .update(
              {
                activatedAt: subscription.activatedAt,
                addOnsTotal: subscription.addOnsTotal,
                autoRenew: subscription.autoRenew,
                bankAccountAuthorizedAt: subscription.bankAccountAuthorizedAt,
                canceledAt: subscription.canceledAt,
                collectionMethod: subscription.collectionMethod,
                currency: subscription.currency,
                currentPeriodEndsAt: subscription.currentPeriodEndsAt,
                currentPeriodStartedAt: subscription.currentPeriodStartedAt,
                currentTermStartedAt: subscription.currentTermStartedAt,
                currentTermEndsAt: subscription.currentTermEndsAt,
                customerNotes: subscription.customerNotes,
                expirationReason: subscription.expirationReason,
                netTerms: subscription.netTerms,
                object: subscription.object,
                quantity: subscription.quantity,
                remainingBillingCycles: subscription.remainingBillingCycles,
                remainingPauseCycles: subscription.remainingPauseCycles,
                renewalBillingCycles: subscription.renewalBillingCycles,
                state: subscription.state,
                subtotal: subscription.subtotal,
                totalBillingCycles: subscription.totalBillingCycles,
                unitAmount: subscription.unitAmount,
                trialEndsAt: subscription.trialEndsAt,
                trialStartedAt: subscription.trialStartedAt,
                createdAt: subscription.createdAt,
                expiresAt: subscription.expiresAt,
                pausedAt: subscription.pausedAt,
                userId: subscription.account.code,
                planId: subscription.plan?.id,
              },
              { where: { id: subscription.id } },
            )
            .then(async record => {
              if (record[0] === 0) {
                console.log('Need New Subs');
                await this.subscriptionRepository
                  .create({
                    id: subscription.id,
                    activatedAt: subscription.activatedAt,
                    addOnsTotal: subscription.addOnsTotal,
                    autoRenew: subscription.autoRenew,
                    bankAccountAuthorizedAt:
                      subscription.bankAccountAuthorizedAt,
                    canceledAt: subscription.canceledAt,
                    collectionMethod: subscription.collectionMethod,
                    currency: subscription.currency,
                    currentPeriodEndsAt: subscription.currentPeriodEndsAt,
                    currentPeriodStartedAt: subscription.currentPeriodStartedAt,
                    currentTermStartedAt: subscription.currentTermStartedAt,
                    currentTermEndsAt: subscription.currentTermEndsAt,
                    customerNotes: subscription.customerNotes,
                    expirationReason: subscription.expirationReason,
                    netTerms: subscription.netTerms,
                    object: subscription.object,
                    quantity: subscription.quantity,
                    remainingBillingCycles: subscription.remainingBillingCycles,
                    remainingPauseCycles: subscription.remainingPauseCycles,
                    renewalBillingCycles: subscription.renewalBillingCycles,
                    state: subscription.state,
                    subtotal: subscription.subtotal,
                    totalBillingCycles: subscription.totalBillingCycles,
                    unitAmount: subscription.unitAmount,
                    trialEndsAt: subscription.trialEndsAt,
                    trialStartedAt: subscription.trialStartedAt,
                    createdAt: subscription.createdAt,
                    expiresAt: subscription.expiresAt,
                    pausedAt: subscription.pausedAt,
                    userId: subscription.account.code,
                    planId: subscription.plan?.id,
                  })
                  .then(async newRecord => {
                    console.log('New Subs', newRecord.id);
                  });
                if (
                  subscription.couponRedemptions != null &&
                  subscription.couponRedemptions.length != 0
                ) {
                  for (const redemption of subscription.couponRedemptions) {
                    await this.subscriptionCouponRedemptionRepository
                      .create({
                        id: redemption.id,
                        object: redemption.object,
                        state: redemption.state,
                        discounted: redemption.discounted,
                        createdAt: redemption.createdAt,
                        subscriptionId: subscription.id,
                        couponId: redemption.coupon?.id,
                      })
                      .then(async newRecord => {
                        console.log('Inserted New Redemption', newRecord.id);
                      });
                  }
                }

                if (
                  subscription.addOns.length != 0 &&
                  subscription.addOns != null
                ) {
                  const subAddOns = subscription.addOns?.map(async addon => {
                    await this.subscriptionAddOnRepository
                      .create({
                        id: addon.id,
                        object: addon.object,
                        quantity: addon.quantity,
                        unitAmount: addon.unitAmount,
                        createdAt: addon.createdAt,
                        expiredAt: addon.expiredAt,
                        subscriptionId: addon.subscriptionId,
                        planAddOnId: addon.addOn.id,
                        updatedAt: addon.updatedAt,
                      })
                      .then(async newRecord => {
                        console.log('Inserted New Sub Add On', newRecord.id);
                      });
                  });
                }
              } else {
                console.log('Updated Subscription');

                if (
                  subscription.couponRedemptions != null &&
                  subscription.couponRedemptions.length != 0
                ) {
                  for (const redemption of subscription.couponRedemptions) {
                    await this.subscriptionCouponRedemptionRepository
                      .update(
                        {
                          object: redemption.object,
                          state: redemption.state,
                          discounted: redemption.discounted,
                          createdAt: redemption.createdAt,
                          subscriptionId: subscription.id,
                          couponId: redemption.coupon?.id,
                        },
                        { where: { id: redemption.id } },
                      )
                      .then(async record => {
                        if (record[0] === 0) {
                          console.log('New Redemption');
                          await this.subscriptionCouponRedemptionRepository
                            .create({
                              id: redemption.id,
                              object: redemption.object,
                              state: redemption.state,
                              discounted: redemption.discounted,
                              createdAt: redemption.createdAt,
                              subscriptionId: subscription.id,
                              couponId: redemption.coupon?.id,
                            })
                            .then(async newRecord => {
                              console.log(
                                'Inserted New Redemption',
                                newRecord.id,
                              );
                            });
                        } else {
                          console.log('Updated Redemption');
                        }
                      });
                  }
                }
                if (
                  subscription.addOns.length != 0 &&
                  subscription.addOns != null
                ) {
                  const subAddOns = subscription.addOns?.map(async addon => {
                    if (addon.addOn.id) {
                      try {
                        await this.subscriptionAddOnRepository
                          .update(
                            {
                              object: addon.object,
                              quantity: addon.quantity,
                              unitAmount: addon.unitAmount,
                              createdAt: addon.createdAt,
                              expiredAt: addon.expiredAt,
                              subscriptionId: addon.subscriptionId,
                              planAddOnId: addon.addOn.id,
                            },
                            { where: { id: addon.id } },
                          )
                          .then(async record => {
                            console.log(record);
                            if (record[0] === 0) {
                              console.log('Need New Sub Add On');
                              await this.subscriptionAddOnRepository
                                .create({
                                  id: addon.id,
                                  object: addon.object,
                                  quantity: addon.quantity,
                                  unitAmount: addon.unitAmount,
                                  createdAt: addon.createdAt,
                                  expiredAt: addon.expiredAt,
                                  subscriptionId: addon.subscriptionId,
                                  planAddOnId: addon.addOn.id,
                                  updatedAt: addon.updatedAt,
                                })
                                .then(async newRecord => {
                                  console.log('New Sub Add On', newRecord.id);
                                });
                            } else {
                              console.log('Updated Add On');
                            }
                          });
                      } catch (e) {
                        console.log(e.message);
                      }
                    }
                  });
                }
              }
            });
        }
        this.logger.log(`Subscription Updated`);
        return;
      } catch (e) {
        console.log(e.message);
        this.logger.error(`Failed with Inserting to DB (SEQUELIZE) `, e.stack);
      }
    } catch (e) {
      this.logger.error(`Failed with Recurly with ID ${subId} `, e.stack);
      console.log(e);
    }
  }
}
