import {
  Subscription,
  SubscriptionAddOn,
  CouponRedemption,
} from '@app/database/entities';
import { RecurlyService } from '@app/recurly';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { omit, pick } from 'lodash';
import to from 'await-to-js';

@Injectable()
export class SubscriptionService {
  private logger = new Logger(SubscriptionService.name);

  private readonly subscriptionRepository: typeof Subscription = this.sequelize.getRepository(
    'Subscription',
  );

  private readonly subscriptionAddOnRepository: typeof SubscriptionAddOn = this.sequelize.getRepository(
    'SubscriptionAddOn',
  );

  private readonly subscriptionCouponRedemptionRepository: typeof CouponRedemption = this.sequelize.getRepository(
    'CouponRedemption',
  );

  constructor(
    @Inject('SEQUELIZE') private readonly sequelize,
    private readonly recurlyService: RecurlyService,
  ) {}

  async updateOrCreate(body: object) {
    const bodyKeys = [
      'newSubscriptionNotification',
      'updatedSubscriptionNotification',
      'canceledSubscriptionNotification',
      'expiredSubscriptionNotification',
      'renewedSubscriptionNotification',
      'reactivatedAccountNotification',
      'subscriptionPausedNotification',
      'subscriptionResumedNotification',
      'scheduledSubscriptionPauseNotification',
      'subscriptionPausedModified',
      'pausedSubscriptionRenewal',
      'subscriptionPauseCanceled',
    ];

    const filterKeys = [
      'id',
      'activatedAt',
      'addOnsTotal',
      'autoRenew',
      'bankAccountAuthorizedAt',
      'canceledAt',
      'collectionMethod',
      'currency',
      'currentPeriodEndsAt',
      'currentPeriodStartedAt',
      'currentTermStartedAt',
      'currentTermEndsAt',
      'customerNotes',
      'expirationReason',
      'netTerms',
      'object',
      'quantity',
      'remainingBillingCycles',
      'remainingPauseCycles',
      'renewalBillingCycles',
      'state',
      'subtotal',
      'totalBillingCycles',
      'unitAmount',
      'trialEndsAt',
      'trialStartedAt',
      'createdAt',
      'expiresAt',
      'pausedAt',
    ];

    const addOnKeys = [
      'id',
      'object',
      'quantity',
      'unitAmount',
      'createdAt',
      'expiredAt',
      'subscriptionId',
      'planAddOnId',
      'updatedAt',
    ];
    const couponKeys = [
      'id',
      'discounted',
      'object',
      'state',
      'createdAt',
      'couponId',
      'subscriptionId',
      'updatedAt',
    ];
    const { subscription }: any = bodyKeys.reduce(
      (r, i) => (!r ? body[i] : r),
      null,
    );

    try {
      const recurlySubscription = await this.recurlyService.getSubscription(
        subscription.uuid,
      );

      const dbSubscription: any = {
        ...pick(recurlySubscription, filterKeys),
        userId: recurlySubscription.account.code,
        planId: recurlySubscription.plan?.id,
      };

      const [err, record] = await to(
        this.subscriptionRepository.update(omit(dbSubscription, ['id']), {
          where: {
            id: dbSubscription.id,
          },
        }),
      );

      if (err || !record[0]) {
        await this.subscriptionRepository.create(dbSubscription);
      }
      if (
        recurlySubscription.addOns.length != 0 &&
        recurlySubscription.addOns != null
      ) {
        recurlySubscription.addOns.map(async addon => {
          const dbAddOn: any = {
            ...pick(addon, addOnKeys),
            planId: addon.addOn.id,
          };

          const [err, record] = await to(
            this.subscriptionAddOnRepository.update(omit(dbAddOn, ['id']), {
              where: {
                id: dbAddOn.id,
              },
            }),
          );

          if (err || !record) {
            await this.subscriptionAddOnRepository.create(dbAddOn);
          }
        });
      }

      if (
        recurlySubscription.couponRedemptions != null &&
        recurlySubscription.couponRedemptions.length != 0
      ) {
        recurlySubscription.couponRedemptions.map(async redemption => {
          const dbCouponRedemption: any = {
            ...pick(redemption, couponKeys),
            couponId: redemption.coupon?.id,
            subscriptionId: recurlySubscription.id,
          };

          const [err, record] = await to(
            this.subscriptionCouponRedemptionRepository.update(
              omit(dbCouponRedemption, ['id']),
              {
                where: {
                  id: dbCouponRedemption.id,
                },
              },
            ),
          );

          if (err || !record) {
            await this.subscriptionCouponRedemptionRepository.create(
              dbCouponRedemption,
            );
          }
        });
      }
    } catch (e) {
      this.logger.error(e);
    }

    return true;
  }
}
