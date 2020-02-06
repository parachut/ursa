import { Body, Controller, Get, Post } from '@nestjs/common';

import { PlanService } from '../services/plan.service';

@Controller()
export class PlanController {
  constructor(private readonly planService: PlanService) { }

  @Get('/plan')
  findPlans() {
    return this.planService.findPlans();
  }



  @Post('/plan')
  getPost(@Body() body: any): string {
    return body;
  }


}
