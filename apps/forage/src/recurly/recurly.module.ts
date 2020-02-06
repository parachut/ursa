import { Module } from '@nestjs/common';
import { RecurlyController } from './recurly.controller';
import { RecurlyService } from './recurly.service';

@Module({
  providers: [RecurlyService],
  controllers: [RecurlyController],
})
export class RecurlyModule {}
