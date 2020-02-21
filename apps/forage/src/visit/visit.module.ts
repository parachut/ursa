import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { VisitService } from './visit.service';

@Module({
  imports: [DatabaseModule],
  providers: [VisitService],
  exports: [VisitService],
})
export class VisitModule {}
