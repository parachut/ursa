import { Module } from '@nestjs/common';
import { EasyPostService } from './easypost.service';

@Module({
  providers: [EasyPostService],
  exports: [EasyPostService],
})
export class EasypostModule {}
