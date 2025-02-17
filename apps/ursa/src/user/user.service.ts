import {
  BillingInfo,
  User,
  UserMarketingSource,
  UserTermAgreement,
} from '@app/database/entities';
import { UserRole } from '@app/database/enums';
import { RecurlyService } from '@app/recurly';
import { Inject, Injectable } from '@nestjs/common';
import short from 'short-uuid';

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

  private readonly translator = short();

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
            [
              UserRole.CONTRIBUTOR,
              UserRole.MEMBER,
              UserRole.AFFILIATE,
            ].includes(role),
          )
        : [UserRole.MEMBER];

    const user = await this.userRepository.create({
      ...input,
      email: input.email?.trim(),
      phone: input.phone?.trim(),
      roles: filteredRoles,
      marketingSources: [marketingSource],
    });

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

    return this.billingInfoRepository.create({ ...billingInfo, userId });
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

  shortId(userId: string) {
    return this.translator.fromUUID(userId);
  }
}
