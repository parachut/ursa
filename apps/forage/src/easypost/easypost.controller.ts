import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { EasyPostService } from '../easypost/easypost.service';

@Controller()
export class EasyPostController {
  constructor(private readonly easyPostService: EasyPostService) {}

  @UseGuards(AuthGuard('local'))
  @Post('/easy_post')
  async easyPost(@Body() body) {
    return this.easyPostService.easyPost(body);
  }
}
