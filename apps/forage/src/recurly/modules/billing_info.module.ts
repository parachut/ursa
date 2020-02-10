import { Module } from '@nestjs/common';
import { BillingController } from '../controllers/billing_info.controller';
import { BillingService } from '../services/billing_info.service';
import { DatabaseModule } from '@app/database';
import { AuthModule } from '..//../auth/auth.module';
@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [BillingService],
  controllers: [BillingController],
})
export class BillingModule { }

