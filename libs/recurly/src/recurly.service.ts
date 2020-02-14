import { User } from '@app/database/entities';
import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as Recurly from 'recurly';

@Injectable()
export class RecurlyService {
  private readonly logger = new Logger(RecurlyService.name);

  private readonly recurlyClient = new Recurly.Client(process.env.RECURLY);

  findRecurlyIntegration(user: User): string {
    return user.integrations.find(int => int.type === 'RECURLY')?.value;
  }

  private buildSubscription(
    planCode: string,
    protectionPlan: boolean,
    additionalItems: number,
  ) {
    const subscriptionReq = {
      planCode,
      addOns: [],
    };

    if (protectionPlan) {
      subscriptionReq.addOns.push({
        code: 'protection',
        quantity: 1,
      });
    }

    if (additionalItems) {
      subscriptionReq.addOns.push({
        code: 'additional',
        quantity: additionalItems,
      });
    }

    if (!subscriptionReq.addOns.length) {
      delete subscriptionReq.addOns;
    }

    return subscriptionReq;
  }

  async createSubscription(
    planCode: string,
    protectionPlan: boolean,
    additionalItems: number,
    couponCode: string,
    recurlyId: string,
    expedited: boolean,
  ) {
    const subscriptionReq = this.buildSubscription(
      planCode,
      protectionPlan,
      additionalItems,
    );

    const purchaseReq = {
      currency: 'USD',
      account: {
        id: recurlyId,
      },
      subscriptions: [subscriptionReq],
      couponCodes: [],
      lineItems: [],
    };

    if (couponCode) {
      purchaseReq.couponCodes.push(couponCode);
    }

    if (!purchaseReq.couponCodes.length) {
      delete purchaseReq.couponCodes;
    }

    if (expedited) {
      purchaseReq.lineItems = [
        {
          type: 'charge',
          currency: 'USD',
          unitAmount: 50,
          quantity: 1,
          description: 'Expedited Shipping',
        },
      ];
    } else {
      delete purchaseReq.lineItems;
    }

    return this.recurlyClient.createPurchase(purchaseReq);
  }

  async expeditedCharge(recurlyId: string) {
    return this.recurlyClient.createPurchase({
      currency: 'USD',
      account: {
        id: recurlyId,
      },
      lineItems: [
        {
          type: 'charge',
          currency: 'USD',
          quantity: 1,
          unitAmount: 50,
          description: 'Expedited Shipping',
        },
      ],
    });
  }

  async upgradePlan(
    planCode: string,
    protectionPlan: boolean,
    additionalItems: number,
    recurlySubscription: string,
  ): Promise<boolean> {
    const subscriptionReq = this.buildSubscription(
      planCode,
      protectionPlan,
      additionalItems,
    );

    try {
      await this.recurlyClient.createSubscriptionChange(
        recurlySubscription,
        subscriptionReq,
      );
      return true;
    } catch (e) {
      if (
        e.message ===
        'The submitted values match the current subscriptions values.'
      ) {
        return true;
      } else {
        this.logger.error(e);
        throw new UnprocessableEntityException();
      }
    }
  }

  async updateBillingInfo(tokenId: string, recurlyId: string) {
    return this.recurlyClient.updateBillingInfo(recurlyId, {
      tokenId,
    });
  }

  xmlDecision(search: string, body: object): boolean {
    const [action] = Object.keys(body);
    return action.search(search) !== -1;
  }

  async getInvoice(invoiceNumber: number) {
    return this.recurlyClient.getInvoice('number-' + invoiceNumber);
  }

  async getSubscription(subscriptionId: string) {
    return this.recurlyClient.getSubscription('uuid-' + subscriptionId);
  }
}
