import { Subscription } from '@app/database/entities';
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

      if (err || !record) {
        await this.subscriptionRepository.create(dbSubscription);
      }
    } catch (e) {
      this.logger.error(e);
    }

    return true;
  }
}
