import { Injectable, Inject } from '@nestjs/common';
import { Plan } from '@app/database/entities';
import * as Recurly from "recurly";
const recurly = new Recurly.Client(process.env.RECURLY);

@Injectable()
export class PlanService {
  private readonly planRepository: typeof Plan = this.sequelize.getRepository(
    'Plan',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) { }

  async findPlans(): Promise<Plan[]> {

    const plansRecurly = recurly.listPlans({ limit: 200 });
    try {
      for await (const plan of plansRecurly.each()) {
        console.log(plan.name)
      }

    } catch (e) {
      console.log(e)
    }




    const plans = await this.planRepository.findAll({});
    return plans;
  }


}
