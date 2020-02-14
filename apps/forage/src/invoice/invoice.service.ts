import { Invoice } from '@app/database/entities';
import { RecurlyService } from '@app/recurly';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { omit, pick } from 'lodash';
import to from 'await-to-js';

@Injectable()
export class InvoiceService {
  private logger = new Logger(InvoiceService.name);

  private readonly invoiceRepository: typeof Invoice = this.sequelize.getRepository(
    'Invoice',
  );

  constructor(
    @Inject('SEQUELIZE') private readonly sequelize,
    private readonly recurlyService: RecurlyService,
  ) {}

  async updateOrCreate(body: object) {
    const bodyKeys = [
      'newCreditInvoiceNotification',
      'processingCreditInvoiceNotification',
      'closedCreditInvoiceNotification',
      'voidedCreditInvoiceNotification',
      'reopenedCreditInvoiceNotification',
      'openCreditInvoiceNotification',
    ];

    const filterKeys = [
      'id',
      'balance',
      'collectionMethod',
      'currency',
      'customerNotes',
      'discount',
      'netTerms',
      'number',
      'object',
      'origin',
      'paid',
      'poNumber',
      'previousInvoiceId',
      'refundableAmount',
      'state',
      'subtotal',
      'tax',
      'total',
      'termsAndConditions',
      'type',
      'vatNumber',
      'vatReverseChargeNotes',
      'dueAt',
      'createdAt',
      'closedAt',
    ];

    const { invoice }: any = bodyKeys.reduce(
      (r, i) => (!r ? body[i] : r),
      null,
    );

    try {
      const recurlyInvoice = await this.recurlyService.getInvoice(
        invoice.invoiceNumber._,
      );

      const dbInvoice: Partial<Invoice> = {
        ...pick(recurlyInvoice, filterKeys),
        number: Number(recurlyInvoice.number),
        refundableAmount: String(recurlyInvoice.refundableAmount),
        subscriptionId: recurlyInvoice.subscriptionIds[0],
        userId: recurlyInvoice.account.code,
      };

      const [err, record] = await to(
        this.invoiceRepository.update(omit(dbInvoice, ['id']), {
          where: {
            id: dbInvoice.id,
          },
        }),
      );

      if (err || !record) {
        await this.invoiceRepository.create(dbInvoice);
      }
    } catch (e) {
      this.logger.error(e);
    }

    return true;
  }
}
