import { Injectable, Inject } from '@nestjs/common';
import { Subscription } from '@app/database/entities';

@Injectable()
export class RecurlyService {
  private readonly subscriptionRepository: typeof Subscription = this.sequelize.getRepository(
    'Subscription',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  async findSubscriptions(): Promise<Subscription[]> {
    const subscriptions = await this.subscriptionRepository.findAll({});
    return subscriptions;
  }

  getHello(): string {
    return 'Hello Recurly!';
  }
}
