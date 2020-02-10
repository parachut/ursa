import { Module } from '@nestjs/common';
import { InvoiceController } from '../controllers/invoice.controller';
import { InvoiceService } from '../services/invoice.service';
import { DatabaseModule } from '@app/database';
import { AuthModule } from '..//../auth/auth.module';
@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [InvoiceService],
  controllers: [InvoiceController],
})
export class InvoiceModule { }

