import { Module } from '@nestjs/common';
import { RecurlyController } from './recurly.controller';
import { RecurlyService } from './recurly.service';
import { DatabaseModule } from '@app/database';
@Module({
  imports: [DatabaseModule],
  providers: [RecurlyService],
  controllers: [RecurlyController],
})
export class RecurlyModule {}
