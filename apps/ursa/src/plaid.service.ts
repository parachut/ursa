import {
  Injectable,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { Client, environments } from 'plaid';
import { UserBankBalance } from '@app/database/entities';

@Injectable()
export class PlaidService {
  private readonly logger = new Logger(PlaidService.name);

  private readonly plaidClient = new Client(
    process.env.PLAID_ID,
    process.env.PLAID_SECRET,
    process.env.PLAID_PUBLIC_KEY,
    environments.production,
  );

  async exchangePublicToken(publicToken: string) {
    return this.plaidClient.exchangePublicToken(publicToken);
  }

  async createProcessorToken(
    accessToken: string,
    accountId: string,
  ): Promise<string> {
    try {
      const res = await this.plaidClient.createProcessorToken(
        accessToken,
        accountId,
        'dwolla',
      );

      return res.processor_token;
    } catch (e) {
      this.logger.error(e);
      throw new UnprocessableEntityException(e);
    }
  }

  async getAccounts(accessToken: string) {
    return this.plaidClient.getAccounts(accessToken);
  }

  async getBalance(accessToken: string): Promise<Partial<UserBankBalance>[]> {
    try {
      const { accounts } = await this.plaidClient.getBalance(accessToken);

      if (accounts && accounts.length) {
        return accounts.map(account => ({
          available: account.balances.available
            ? Math.round(account.balances.available * 100)
            : null,
          name: account.name,
          limit: account.balances.limit
            ? Math.round(account.balances.limit * 100)
            : null,
          current: Math.round(account.balances.current * 100),
        }));
      }
    } catch (e) {
      this.logger.error(e);
    }
  }
}
