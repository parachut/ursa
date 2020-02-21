import { Injectable, Inject, Logger } from '@nestjs/common';
import { Invoice } from '@app/database/entities';
import Recurly from 'recurly';
const recurly = new Recurly.Client(process.env.RECURLY);

@Injectable()
export class InvoiceService {
  private logger = new Logger('InvoiceService');
  private readonly invoiceRepository: typeof Invoice = this.sequelize.getRepository(
    'Invoice',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  async findInvoices(invoiceID): Promise<Invoice[]> {
    console.log(invoiceID);
    try {
      const invoice = await recurly.getInvoice(invoiceID);
      try {
        await this.invoiceRepository
          .update(
            {
              balance: invoice.balance,
              collectionMethod: invoice.collectionMethod,
              currency: invoice.currency,
              customerNotes: invoice.customerNotes,
              discount: invoice.discount,
              netTerms: invoice.netTerms,
              number: invoice.number,
              object: invoice.object,
              origin: invoice.origin,
              paid: invoice.paid,
              poNumber: invoice.poNumber,
              previousInvoiceId: invoice.previousInvoiceId,
              refundableAmount: invoice.refundableAmount,
              state: invoice.state,
              subtotal: invoice.subtotal,
              tax: invoice.tax,
              total: invoice.total,
              termsAndConditions: invoice.termsAndConditions,
              type: invoice.type,
              vatNumber: invoice.vatNumber,
              vatReverseChargeNotes: invoice.vatReverseChargeNotes,
              dueAt: invoice.dueAt,
              createdAt: invoice.createdAt,
              closedAt: invoice.closedAt,
              subscriptionId: invoice.subscriptionIds[0],
              userId: invoice.account.code,
            },
            { where: { id: invoice.id } },
          )
          .then(async record => {
            if (record[0] === 0) {
              await this.invoiceRepository
                .create({
                  id: invoice.id,
                  balance: invoice.balance,
                  collectionMethod: invoice.collectionMethod,
                  currency: invoice.currency,
                  customerNotes: invoice.customerNotes,
                  discount: invoice.discount,
                  netTerms: invoice.netTerms,
                  number: invoice.number,
                  object: invoice.object,
                  origin: invoice.origin,
                  paid: invoice.paid,
                  poNumber: invoice.poNumber,
                  previousInvoiceId: invoice.previousInvoiceId,
                  refundableAmount: invoice.refundableAmount,
                  state: invoice.state,
                  subtotal: invoice.subtotal,
                  tax: invoice.tax,
                  total: invoice.total,
                  termsAndConditions: invoice.termsAndConditions,
                  type: invoice.type,
                  vatNumber: invoice.vatNumber,
                  vatReverseChargeNotes: invoice.vatReverseChargeNotes,
                  dueAt: invoice.dueAt,
                  createdAt: invoice.createdAt,
                  closedAt: invoice.closedAt,
                  subscriptionId: invoice.subscriptionIds[0],
                  userId: invoice.account.code,
                })
                .then(async newRecord => {
                  console.log('New Invoice', newRecord);
                });

              console.log('Inserted');
            } else {
              console.log('Updated');
            }
          });
      } catch (e) {
        console.log(e.message);
        this.logger.error(`Failed with Inserting to DB (SEQUELIZE) `, e.stack);
      }
    } catch (e) {
      console.log(e.message);
      this.logger.error(
        `Failed with Recurly (getInvoice) or with ID ${invoiceID} `,
        e.stack,
      );
    }

    this.logger.log(`Subscription Updated`);
    return;
  }
}
