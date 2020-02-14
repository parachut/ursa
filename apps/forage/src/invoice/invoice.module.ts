import { DatabaseModule } from '@app/database';
import { RecurlyService } from '@app/recurly';
import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';

@Module({
  imports: [DatabaseModule],
  providers: [InvoiceService, RecurlyService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
