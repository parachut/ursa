import { Injectable, Inject, Logger } from '@nestjs/common';
import { Plan, PlanAddOn } from '@app/database/entities';
import * as Recurly from "recurly";
const recurly = new Recurly.Client(process.env.RECURLY);

@Injectable()
export class PlanService {
  private logger = new Logger('PlanService')

  private readonly planRepository: typeof Plan = this.sequelize.getRepository(
    'Plan',
  );
  private readonly plan_add_onRepository: typeof PlanAddOn = this.sequelize.getRepository(
    'PlanAddOn',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) { }

  async findPlans(): Promise<Plan[]> {

    try {
      const plansRecurly = recurly.listPlans({ limit: 200 });
      for await (const plan of plansRecurly.each()) {
        try {
          await this.planRepository.update({
            //id: plan.id,
            code: plan.code,
            accountingCode: plan.accountingCode,
            autoRenew: plan.autoRenew,
            currencies: JSON.stringify(plan.currencies?.map(price => ({
              currency: price.currency,
              setupFee: price.setupFee,
              unitAmount: price.unitAmount
            }))),
            description: plan.description,
            intervalLength: plan.intervalLength,
            intervalUnit: plan.intervalUnit,
            name: plan.name,
            object: plan.object,
            setupFeeAccountingCode: plan.setupFeeAccountingCode,
            state: plan.state,
            taxCode: plan.taxCode,
            taxExempt: plan.taxExempt,
            totalBillingCycles: plan.totalBillingCycles,
            trialLength: plan.trialLength,
            createdAt: plan.createdAt,
            deletedAt: plan.updatedAt,
            trialUnit: plan.trialUnit
          }, { where: { id: plan.id, } }).then(async record => {

            if (record[0] === 0) {

              await this.planRepository.create({
                id: plan.id,
                code: plan.code,
                accountingCode: plan.accountingCode,
                autoRenew: plan.autoRenew,
                currencies: JSON.stringify(plan.currencies?.map(price => ({
                  currency: price.currency,
                  setupFee: price.setupFee,
                  unitAmount: price.unitAmount
                }))),
                description: plan.description,
                intervalLength: plan.intervalLength,
                intervalUnit: plan.intervalUnit,
                name: plan.name,
                object: plan.object,
                setupFee_accounting_code: plan.setupFeeAccountingCode,
                state: plan.state,
                taxCode: plan.taxCode,
                taxExempt: plan.taxExempt,
                totalBilling_cycles: plan.totalBillingCycles,
                trialLength: plan.trialLength,
                createdAt: plan.createdAt,
                deletedAt: plan.updatedAt,
                trialUnit: plan.trialUnit
              }).then(async newRecord => {
                console.log("New Plan", newRecord)
              })

              console.log("Inserted New Plan")
            }
            else {
              console.log("Updated Plan")
            }

          });
          //  this.logger.error(`Plans Updated`)
        } catch (e) {
          console.log(e)
          this.logger.error(`Failed with Inserting to DB (SEQUELIZE) `, e.stack)
        }
      }
    } catch (e) {
      console.log(e)
      this.logger.error(`Failed with Recurly (listPlans) `, e.stack)
    }

    try {
      const addons = recurly.listAddOns({ limit: 200 });

      for await (const addon of addons.each()) {
        try {

          await this.plan_add_onRepository.update({

            accountingCode: addon.accountingCode,
            code: addon.code,
            currencies: JSON.stringify(addon.currencies?.map(price => ({
              currency: price.currency,
              unitAmount: price.unitAmount
            }))),
            name: addon.name,
            object: addon.object,
            defaultQuantity: addon.defaultQuantity,
            displayQuantity: addon.displayQuantity,
            state: addon.state,
            taxCode: addon.taxCode,
            createdAt: addon.createdAt,
            deletedAt: addon.updatedAt,
            planId: addon.planId

          }, { where: { id: addon.id } }).then(async record => {

            if (record[0] === 0) {

              await this.plan_add_onRepository.create({
                id: addon.id,
                accountingCode: addon.accountingCode,
                code: addon.code,
                currencies: JSON.stringify(addon.currencies?.map(price => ({
                  currency: price.currency,
                  unitAmount: price.unitAmount
                }))),
                name: addon.name,
                object: addon.object,
                defaultQuantity: addon.defaultQuantity,
                displayQuantity: addon.displayQuantity,
                state: addon.state,
                taxCode: addon.taxCode,
                createdAt: addon.createdAt,
                deletedAt: addon.updatedAt,
                planId: addon.planId



              }).then(async newRecord => {
                console.log("New Plan Add On", newRecord)
              })

              console.log("Inserted Plan Add On")
            }
            else {
              console.log("Updated Plan Add On")
            }


          });


          //this.logger.error(`Plans Add On Updated`)
        }
        catch (e) {
          console.log(e)
          this.logger.error(`Failed with Inserting to DB (SEQUELIZE) `, e.stack)
        }

      }
    } catch (e) {
      console.log(e.message)
      this.logger.error(`Failed with Recurly (listAddOns) `, e.stack)
    }

    this.logger.log(`Plans Updated`)
    return;
  }


}
