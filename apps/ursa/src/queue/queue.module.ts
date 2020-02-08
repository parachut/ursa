import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { QueueResolver } from './queue.resolver';
import { QueueService } from './queue.service';

@Module({
  imports: [DatabaseModule],
  providers: [QueueService, QueueResolver],
})
export class QueueModule {}
