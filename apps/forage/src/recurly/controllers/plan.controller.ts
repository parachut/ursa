import { Body, Controller, Get, Post } from '@nestjs/common';

import { PlanService } from '../services/plan.service';

@Controller()
export class PlanController {
  constructor(private readonly planService: PlanService) { }

  @Post('/plan')
  findPlans() {
    return this.planService.findPlans();
  }

}
