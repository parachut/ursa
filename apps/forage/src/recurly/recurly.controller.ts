import { Body, Controller, Get, Post } from '@nestjs/common';

import { RecurlyService } from './recurly.service';

@Controller()
export class RecurlyController {
  constructor(private readonly recurlyService: RecurlyService) {}

  @Get('/recurly')
  getHello(): string {
    return this.recurlyService.getHello();
  }

  @Post('/recurly')
  getPost(@Body() body: any): string {
    return body;
  }
}
