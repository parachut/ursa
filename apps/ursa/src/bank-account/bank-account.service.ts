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
    accessToken: string,
    accountId: string,
    userId: string,
    ipAddress: string,
  ) {
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

    const { accounts } = await this.plaidService.getAccounts(accessToken);

    if (accounts && accounts.length) {
      let userBankAccount;

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

      for (const account of accounts) {
        const plaidToken = await this.plaidService.createProcessorToken(
          accessToken,
          accountId,
        );
        const fundingSourceRef = await this.dwollaService.createOrFindFundingSource(
          dwollaIntegration.value,
          plaidToken,
          userId,
        );

        const newBankAccount = await this.bankAccountRepository.create({
          accountId: account.account_id,
          primary: account.account_id === accountId,
          name: account.name,
          mask: account.mask,
          subtype: account.subtype,
          userId,
          plaidUrl: fundingSourceRef,
        });

        if (account.account_id === accountId) {
          userBankAccount = newBankAccount;
        }
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
    } else {
      throw new NotFoundException();
    }
  }
}
