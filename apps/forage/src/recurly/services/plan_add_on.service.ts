import { Injectable, Inject } from '@nestjs/common';
import { PlanAddOn } from '@app/database/entities';
import * as Recurly from "recurly";
const recurly = new Recurly.Client(process.env.RECURLY);

@Injectable()
export class PlanAddOnService {
  private readonly plan_add_onRepository: typeof PlanAddOn = this.sequelize.getRepository(
    'PlanAddOn',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  async findPlanAddOn(): Promise<PlanAddOn[]> {
    const planAddOn = await this.plan_add_onRepository.findAll({});
    return planAddOn;
  }

}
