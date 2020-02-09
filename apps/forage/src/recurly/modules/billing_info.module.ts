import { Module } from '@nestjs/common';
import { BillingController } from '../controllers/billing_info.controller';
import { BillingService } from '../services/billing_info.service';
import { DatabaseModule } from '@app/database';
@Module({
  imports: [DatabaseModule],
  providers: [BillingService],
  controllers: [BillingController],
})
export class BillingModule { }

