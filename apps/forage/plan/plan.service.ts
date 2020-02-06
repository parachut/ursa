import { Injectable } from '@nestjs/common';

@Injectable()
export class PlanService {
  getHello(body): string {
    return body;
  }

}
