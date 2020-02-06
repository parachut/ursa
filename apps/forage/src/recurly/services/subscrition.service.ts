import { Injectable, Inject } from '@nestjs/common';
import { Subscription } from '@app/database/entities';
import * as Recurly from "recurly";
const recurly = new Recurly.Client(process.env.RECURLY);

@Injectable()
export class SubscriptionService {
  private readonly subscriptionRepository: typeof Subscription = this.sequelize.getRepository(
    'Subscription',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) { }

  async findSubscriptions(): Promise<Subscription[]> {


    const subscriptionsRecurly = recurly.listSubscriptions({ limit: 200 });

    try {
      for await (const subscription of subscriptionsRecurly.each()) {
        console.log(subscription.id)
      }

    } catch (e) {
      console.log(e)
    }




    const subscriptions = await this.subscriptionRepository.findAll({});
    return subscriptions;
  }


}
