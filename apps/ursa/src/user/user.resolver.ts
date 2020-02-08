import { User } from '@app/database/entities';
import { Logger, UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../current-user.decorator';
import { GqlAuthGuard } from '../gql-auth.guard';
import { UserService } from './user.service';

@Resolver(User)
export class UserResolver {
  private readonly logger = new Logger(UserResolver.name);

  constructor(private readonly userService: UserService) {}

  @Query(type => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: User) {
    console.log(user);
    return this.userService.findOne(user.id);
  }
}
