import {
  User,
  UserMarketingSource,
  UserTermAgreement,
} from '@app/database/entities';
import { UserRole } from '@app/database/enums';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly userRepository: typeof User = this.sequelize.getRepository(
    'User',
  );
  private readonly userAgreementRepository: typeof UserTermAgreement = this.sequelize.getRepository(
    'UserTermAgreement',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

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
    marketingSource: Partial<UserMarketingSource>,
  ) {
    const filteredRoles =
      roles && roles.length
        ? roles.filter(role =>
            [UserRole.CONTRIBUTOR, UserRole.MEMBER].includes(role),
          )
        : [UserRole.MEMBER];

    return this.userRepository.create({
      ...input,
      roles: filteredRoles,
      termAgreements: [
        {
          type: roles && roles.length > 1 ? 'EARN' : 'ACCESS',
          agreed: true,
        },
      ],
      marketingSources: [marketingSource],
    });
  }

  async findOne(userId: string) {
    return this.userRepository.findByPk(userId);
  }
}
