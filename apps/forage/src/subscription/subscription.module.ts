import { RecurlyService } from '@app/recurly';
import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [DatabaseModule],
  providers: [SubscriptionService, RecurlyService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
