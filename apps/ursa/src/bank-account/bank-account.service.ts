import { User, UserBankAccount } from '@app/database/entities';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { DwollaService } from '../dwolla.service';
import { PlaidService } from '../plaid.service';

@Injectable()
export class BankAccountService {
  private readonly logger = new Logger(BankAccountService.name);

  private readonly userRepository: typeof User = this.sequelize.getRepository(
    'User',
  );
  private readonly bankAccountRepository: typeof UserBankAccount = this.sequelize.getRepository(
    'UserBankAccount',
  );

  constructor(
    @Inject('SEQUELIZE') private readonly sequelize,
    private readonly dwollaService: DwollaService,
    private readonly plaidService: PlaidService,
  ) {}

  async findOne(id: string, userId: string) {
    const account = await this.bankAccountRepository.findOne({
      where: { id, userId },
    });

    if (!account) {
      throw new NotFoundException(id);
    }

    return account;
  }

  async find(userId: string) {
    return this.bankAccountRepository.findAll({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  async create(
    publicToken: string,
    accountId: string,
    userId: string,
    ipAddress: string,
  ) {
    const {
      access_token: accessToken,
    } = await this.plaidService.exchangePublicToken(publicToken);

    const user = await this.userRepository.findByPk(userId, {
      include: ['integrations'],
    });

    let dwollaIntegration = user.integrations.find(i => i.type === 'DWOLLA');

    if (!dwollaIntegration) {
      const newDwollaIntegration = await this.dwollaService.createAccount(
        user,
        ipAddress,
      );

      dwollaIntegration = await user.$create(
        'integration',
        newDwollaIntegration,
      );
    }

    await user.$create('integration', {
      type: 'PLAID',
      value: accessToken,
      userId,
    });

    const plaidToken = await this.plaidService.createProcessorToken(
      accessToken,
      accountId,
    );
    const fundingSourceRef = await this.dwollaService.createOrFindFundingSource(
      dwollaIntegration.value,
      plaidToken,
      userId,
    );

    let userBankAccount;

    try {
      const { accounts } = await this.plaidService.getAccounts(accessToken);

      if (accounts && accounts.length) {
        await this.bankAccountRepository.update(
          {
            primary: false,
          },
          {
            where: {
              userId,
            },
          },
        );

        const mainAccount = accounts.find(i => i.account_id === accountId);

        userBankAccount = await this.bankAccountRepository.create({
          accountId: mainAccount.account_id,
          primary: true,
          name: mainAccount.name,
          mask: mainAccount.mask,
          subtype: mainAccount.subtype,
          userId,
          plaidUrl: fundingSourceRef,
        });
      } else {
        throw new NotFoundException();
      }
    } catch (e) {
      userBankAccount = await this.bankAccountRepository.create({
        accountId,
        primary: true,
        name: 'Primary Account',
        mask: '****',
        subtype: 'Bank',
        userId,
        plaidUrl: fundingSourceRef,
      });
    }

    try {
      const balances = await this.plaidService.getBalance(accessToken);

      if (balances && balances.length) {
        await this.userRepository.bulkCreate(balances);
      }
    } catch (e) {
      this.logger.error(e);
      // fail gracefully
    }

    return userBankAccount;
  }
}
