import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module';
import { SubscriptionController } from '../controllers/subscrition.controller';
import { SubscriptionService } from '../services/subscrition.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [SubscriptionService],
  controllers: [SubscriptionController],
})
export class SubscriptionModule {}
