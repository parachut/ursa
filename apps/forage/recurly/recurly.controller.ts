import { Controller, Get } from '@nestjs/common';
import { RecurlyService } from './recurly.service';

@Controller("recurly")
export class RecurlyController {
  constructor(private readonly recurlyService: RecurlyService) { }

  @Get()
  getHello(): string {
    return this.recurlyService.getHello();
  }
}
