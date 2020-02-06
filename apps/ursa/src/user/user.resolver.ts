import { User } from '@app/database/entities';
import { Logger } from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';

import { UserService } from './user.service';

@Resolver(User)
export class UserResolver {
  private readonly logger = new Logger(UserResolver.name);

  constructor(private readonly userService: UserService) {}
}
