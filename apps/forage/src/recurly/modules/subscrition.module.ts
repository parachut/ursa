import { Module } from '@nestjs/common';
import { SubscriptionController } from '../controllers/subscrition.controller';
import { SubscriptionService } from '../services/subscrition.service';
import { DatabaseModule } from '@app/database';
import { AuthModule } from '..//../auth/auth.module';
@Module({
  imports: [DatabaseModule,AuthModule],
  providers: [SubscriptionService],
  controllers: [SubscriptionController],
})
export class SubscriptionModule {}
