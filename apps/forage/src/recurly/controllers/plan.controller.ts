import { Body, Controller, Get, Post, UseGuards, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PlanService } from '../services/plan.service';

@Controller()
export class PlanController {
  constructor(private readonly planService: PlanService) { }

  @UseGuards(AuthGuard('local'))
  @Post('/plan')
  findPlans() {
    return this.planService.findPlans();
  }

}
