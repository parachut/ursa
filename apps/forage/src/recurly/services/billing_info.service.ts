import { Injectable, Inject, Logger } from '@nestjs/common';
import { BillingInfo } from '@app/database/entities';
import * as Recurly from "recurly";
const recurly = new Recurly.Client(process.env.RECURLY);

@Injectable()
export class BillingService {
  private logger = new Logger('BillingService')
  private readonly billingRepository: typeof BillingInfo = this.sequelize.getRepository(
    'BillingInfo',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) { }

  async findBilling(): Promise<BillingInfo[]> {

    try {
      const subscriptionsRecurly = recurly.listSubscriptions({ limit: 200 });
      for await (const subscription of subscriptionsRecurly.each()) {

        try {
          const billingInfo = await recurly.getBillingInfo(
            subscription.account.id
          );

          if (subscription.account && subscription.account.id) {
            try {
              await this.billingRepository.update({

                company: billingInfo.company,
                firstName: billingInfo.firstName,
                lastName: billingInfo.lastName,
                valid: billingInfo.valid,
                vatNumber: billingInfo.vatNumber,
                paymentMethod: billingInfo.paymentMethod,
                updatedBy: billingInfo.updatedBy,
                object: billingInfo.object,
                updatedAt: billingInfo.updatedAt,
                userId: subscription.account.code


              }, { where: { id: billingInfo.id, } })
                .then(async record => {
                  if (record[0] === 0) {
                    console.log("Need New")
                    await this.billingRepository.create({
                      id: billingInfo.id,
                      company: billingInfo.company,
                      firstName: billingInfo.firstName,
                      lastName: billingInfo.lastName,
                      valid: billingInfo.valid,
                      vatNumber: billingInfo.vatNumber,
                      paymentMethod: billingInfo.paymentMethod,
                      updatedBy: billingInfo.updatedBy,
                      object: billingInfo.object,
                      updatedAt: billingInfo.updatedAt,
                      userId: subscription.account.code

                    }).then(async newRecord => {
                      console.log("New Billing", newRecord.id)
                    })

                  } else {
                    console.log("Updated")
                  }
                })
            }
            catch (e) {
              console.log(e.message)
              this.logger.error(`Failed with Inserting to DB (SEQUELIZE) `, e.stack)
            }
          }
        } catch (e) {
          console.log(e.message)
          this.logger.error(`Failed with Recurly (getBillingInfo) `, e.stack)
        }

      }
    } catch (e) {
      console.log(e)
      this.logger.error(`Failed with Recurly (listSubscriptions) `, e.stack)
    }




    const billings = await this.billingRepository.findAll({});
    return billings;
  }


}
