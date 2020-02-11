import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { EasyPostController } from '../easypost/easypost.controller';
import { EasyPostService } from '../easypost/easypost.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [EasyPostService],
  controllers: [EasyPostController],
})
export class EasypostModule {}
