import { Module } from '@nestjs/common';
import { InvoiceController } from '../controllers/invoice.controller';
import { InvoiceService } from '../services/invoice.service';
import { DatabaseModule } from '@app/database';
@Module({
  imports: [DatabaseModule],
  providers: [InvoiceService],
  controllers: [InvoiceController],
})
export class InvoiceModule { }

