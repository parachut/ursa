import { Module } from '@nestjs/common';
import { RecurlyService } from './recurly.service';

@Module({
  providers: [RecurlyService],
  exports: [RecurlyService],
})
export class RecurlyModule {}
