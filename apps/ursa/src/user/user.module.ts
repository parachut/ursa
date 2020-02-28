import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { RecurlyService } from '../recurly.service';

@Module({
  imports: [],
  providers: [UserResolver, UserService, RecurlyService],
})
export class UserModule {}
