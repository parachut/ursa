import { Invoice, Transaction } from '@app/database/entities';
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

  private readonly transactionRepository: typeof Transaction = this.sequelize.getRepository(
    'Invoice',
  );

  constructor(
    @Inject('SEQUELIZE') private readonly sequelize,
    private readonly recurlyService: RecurlyService,
  ) { }

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

    const transactionKeys = [
      'id',
      'amount',
      'avsCheck',
      'collectionMethod',
      'currency',
      'customerMessage',
      'customerMessageLocale',
      'cvvCheck',
      'gatewayApprovalCode',
      'gatewayMessage',
      'gatewayReference',
      'gatewayResponseCode',
      'gatewayResponseTime',
      'ipAddressCountry',
      'ipAddressV4',
      'object',
      'origin',
      'originalTransactionId',
      'postage',
      'paymentMethod',
      'refunded',
      'status',
      'statusCode',
      'statusMessage',
      'success',
      'type',
      'uuid',
      'createdAt',
      'collectedAt',
      'voidedAt',
      'invoiceId',
      'userId',
      'updatedAt'
    ]

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

      if (recurlyInvoice.transactions.length != 0 && recurlyInvoice.transactions != null) {
        recurlyInvoice.transactions.map(async transaction => {
          const dbTransaction: Partial<Transaction> = {
            ...pick(transaction, transactionKeys),
            invoice: transaction.invoice.id,
            userId: transaction.account.code,
            updatedAt: recurlyInvoice.updatedAt
          };

          const [err, record] = await to(
            this.transactionRepository.update(omit(dbTransaction, ['id']), {
              where: {
                id: dbTransaction.id,
              },
            }),
          );

          if (err || !record) {
            await this.transactionRepository.create(dbTransaction);
          }
        })

      }
    } catch (e) {
      this.logger.error(e);
    }

    return true;
  }
}
