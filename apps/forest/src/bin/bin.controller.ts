import { Body, Controller, Get, Post, UseGuards, BadRequestException, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BinDto } from './dto/bin.dto';
import { BinService } from './bin.service';

@Controller()
export class BinController {
  constructor(private readonly binService: BinService) { }

  @UseGuards(AuthGuard('jwt'))
  @Post('/actions/generate-labels')
  async generateLabel() {
   
    await this.binService.generateLabels()

    return {
      success: 'Labels Generated',
    }
  }
}
