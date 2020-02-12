import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module';
import { BillingController } from '../controllers/billing_info.controller';
import { BillingService } from '../services/billing_info.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [BillingService],
  controllers: [BillingController],
})
export class BillingModule {}
