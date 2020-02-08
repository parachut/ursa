import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { User, UserIntegration } from '@app/database/entities';
import * as Dwolla from 'dwolla-v2';

@Injectable()
export class DwollaService {
  private readonly dwollaClient = new Dwolla.Client({
    key: process.env.DWOLLA_KEY,
    secret: process.env.DWOLLA_SECRET,
    environment: 'production',
  });

  private appToken: any;

  async onModuleInit(): Promise<void> {
    this.appToken = await this.dwollaClient.auth.client();
  }

  async createAccount(
    user: User,
    ipAddress: string,
  ): Promise<Partial<UserIntegration>> {
    const dwollaCustomerRequest: any = {
      firstName: user.parsedName.first,
      lastName: user.parsedName.last,
      email: user.email,
      type: 'receive-only',
      ipAddress: ipAddress,
    };

    if (user.businessName && user.businessName.length) {
      dwollaCustomerRequest.businessName = user.businessName;
    }

    const userUrl = await this.appToken
      .post('customers', dwollaCustomerRequest)
      .then(res => res.headers.get('location'));

    return {
      type: 'DWOLLA',
      value: userUrl,
      userId: user.id,
    };
  }

  async createOrFindFundingSource(
    dwollaAccountRef: string,
    plaidToken: string,
    name: string,
  ): Promise<string> {
    try {
      const dwollaRef = await this.appToken
        .post(`${dwollaAccountRef}/funding-sources`, {
          plaidToken,
          name,
        })
        .then(res => res.headers.get('location'));

      return dwollaRef;
    } catch (e) {
      const existingAccount = JSON.parse(e)?._links?.about?.href;

      if (existingAccount) {
        return existingAccount;
      }

      throw new UnprocessableEntityException();
    }
  }

  async createDeposit(
    dwollaRef: string,
    amount: number,
    paymentId: string,
    userId: string,
  ): Promise<string> {
    const accountUrl = await this.appToken
      .get('/')
      .then(res => res.body._links.account.href);

    const masterFundingSource = await this.appToken
      .get(`${accountUrl}/funding-sources`)
      .then(res => res.body._embedded['funding-sources'][0]._links.self.href);

    const requestBody = {
      _links: {
        source: {
          href: masterFundingSource,
        },
        destination: {
          href: dwollaRef,
        },
      },
      amount: {
        currency: 'USD',
        value: amount.toFixed(2),
      },
      metadata: {
        paymentId,
        userId,
        note: 'Deposit initiated by contributor.',
      },
      clearing: {
        destination: 'next-available',
      },
      correlationId: paymentId,
    };

    return this.appToken
      .post('transfers', requestBody)
      .then(res => res.headers.get('location'));
  }
}
