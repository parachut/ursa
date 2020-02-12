import {
  BillingInfo,
  User,
  UserMarketingSource,
  UserTermAgreement,
} from '@app/database/entities';
import { UserRole } from '@app/database/enums';
import { Inject, Injectable } from '@nestjs/common';
import { RecurlyService } from '../recurly.service';

@Injectable()
export class UserService {
  private readonly billingInfoRepository: typeof BillingInfo = this.sequelize.getRepository(
    'BillingInfo',
  );

  private readonly userRepository: typeof User = this.sequelize.getRepository(
    'User',
  );
  private readonly userAgreementRepository: typeof UserTermAgreement = this.sequelize.getRepository(
    'UserTermAgreement',
  );

  private readonly userMarketingSourceRepository: typeof UserMarketingSource = this.sequelize.getRepository(
    'UserMarketingSource',
  );

  constructor(
    @Inject('SEQUELIZE') private readonly sequelize,
    private readonly recurlyService: RecurlyService,
  ) {}

  async agreeToTerms(userId: string, type: string) {
    return this.userAgreementRepository.create({
      type,
      agreed: true,
      userId,
    });
  }

  async createUser(
    input: Partial<User>,
    roles: UserRole[],
    marketingSource?: Partial<UserMarketingSource>,
  ) {
    const filteredRoles =
      roles && roles.length
        ? roles.filter(role =>
            [UserRole.CONTRIBUTOR, UserRole.MEMBER].includes(role),
          )
        : [UserRole.MEMBER];

    const user = await this.userRepository.create({
      ...input,
      roles: filteredRoles,
      marketingSources: [marketingSource],
    });

    await this.agreeToTerms(
      user.get('id'),
      filteredRoles && filteredRoles.length > 1 ? 'EARN' : 'ACCESS',
    );

    if (marketingSource) {
      await this.userMarketingSourceRepository.create({
        ...marketingSource,
        userId: user.get('id'),
      });
    }

    return user;
  }

  async findOne(userId: string) {
    return this.userRepository.findByPk(userId);
  }

  async updateBillingInfo(token: string, userId: string): Promise<BillingInfo> {
    const user = await this.userRepository.findByPk(userId, {
      include: ['integrations', 'billingInfo'],
    });

    const recurlyId = this.recurlyService.findRecurlyIntegration(user);
    const billingInfo = await this.recurlyService.updateBillingInfo(
      token,
      recurlyId,
    );

    if (user.billingInfo) {
      await this.billingInfoRepository.destroy({
        where: {
          userId,
        },
      });
    }

    return this.billingInfoRepository.create(billingInfo);
  }

  async subscription(user: User) {
    const subscription = await user.$get('subscription', {
      include: ['plan', { association: 'addOns', include: ['planAddOn'] }],
    });

    if (!subscription) {
      return null;
    }

    const additionalItems = subscription.addOns.find(
      addOn => addOn.planAddOn.code === 'overage',
    );

    return {
      planName: subscription.plan.name,
      subtotal: subscription.subtotal,
      nextBillingDate: subscription.currentPeriodEndsAt,
      protectionPlan: !!subscription.addOns.find(
        addOn => addOn.planAddOn.code === 'protection',
      ),
      additionalItems: additionalItems ? additionalItems.quantity : 0,
    };
  }
}
