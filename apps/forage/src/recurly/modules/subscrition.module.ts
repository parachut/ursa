import { Module } from '@nestjs/common';
import { SubscriptionController } from '../controllers/subscrition.controller';
import { SubscriptionService } from '../services/subscrition.service';
import { DatabaseModule } from '@app/database';
@Module({
  imports: [DatabaseModule],
  providers: [SubscriptionService],
  controllers: [SubscriptionController],
})
export class SubscriptionModule {}
