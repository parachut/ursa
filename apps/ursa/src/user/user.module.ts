import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [DatabaseModule],
  providers: [UserResolver, UserService],
})
export class UserModule {}
