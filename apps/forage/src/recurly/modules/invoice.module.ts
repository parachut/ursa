import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module';
import { InvoiceController } from '../controllers/invoice.controller';
import { InvoiceService } from '../services/invoice.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [InvoiceService],
  controllers: [InvoiceController],
})
export class InvoiceModule {}
