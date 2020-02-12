import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { EasyPostService } from '../easypost/easypost.service';
import { EasyPostHookDto } from './dto/easy-post-hook.dto';

@Controller()
export class EasyPostController {
  constructor(private readonly easyPostService: EasyPostService) {}

  @Post('/easypost')
  async easyPost(@Body() easyPostHookDto: EasyPostHookDto) {
    const easyPostId = easyPostHookDto?.result?.id;

    if (!easyPostId) {
      return 'No shipmentId found.';
    }

    if (easyPostHookDto.description === 'tracker.updated') {
      await this.easyPostService.updateShipment(easyPostId);
    }

    return 'Shipment updated.';
  }
}
