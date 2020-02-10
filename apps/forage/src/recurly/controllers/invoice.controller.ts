import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InvoiceService } from '../services/invoice.service';

@Controller()
export class InvoiceController {
  constructor(private readonly planService: InvoiceService) { }
  @UseGuards(AuthGuard('local'))
  @Post('/invoice')
  findInvoices(@Body() body) {
    return this.planService.findInvoices("number-"+body.new_invoice_notification.invoice[0].invoice_number[0]._);
  }

}
