import { Injectable, Inject } from '@nestjs/common';
import { Invoice } from '@app/database/entities';
import * as Recurly from "recurly";
const recurly = new Recurly.Client(process.env.RECURLY);

@Injectable()
export class InvoiceService {
  private readonly invoiceRepository: typeof Invoice = this.sequelize.getRepository(
    'Invoice',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) { }

  async findInvoices(): Promise<Invoice[]> {

    const invoices = await this.invoiceRepository.findAll({});
    return invoices;
  }

}
