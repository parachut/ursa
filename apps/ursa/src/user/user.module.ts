import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { RecurlyModule } from '@app/recurly';

@Module({
  imports: [RecurlyModule],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
