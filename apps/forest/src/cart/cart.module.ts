import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [],
})
export class LogInAsModule {}
