import { ShipKit, User } from '@app/database/entities';
import { Logger, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../current-user.decorator';
import { GqlAuthGuard } from '../gql-auth.guard';
import { ShipKitUpdateInput } from './dto/ship-kit-update.input';
import { ShipKitService } from './ship-kit.service';

@Resolver(of => ShipKit)
export class ShipKitResolver {
  private readonly logger = new Logger(ShipKitResolver.name);

  constructor(private readonly shipKitService: ShipKitService) {}

  @Query(type => ShipKit)
  @UseGuards(GqlAuthGuard)
  async shipKit(@Args('id') id: string, @CurrentUser() user: User) {
    return this.shipKitService.findOne(user.id);
  }

  @Query(returns => [ShipKit])
  @UseGuards(GqlAuthGuard)
  async shipKits(@CurrentUser() user: User) {
    return this.shipKitService.find(user.id);
  }

  @Mutation(returns => ShipKit)
  @UseGuards(GqlAuthGuard)
  async shipKitUpdate(
    @Args('input')
    input: ShipKitUpdateInput,
    @CurrentUser() user: User,
  ) {
    return this.shipKitService.update(input, user.id);
  }

  @Mutation(returns => ShipKit)
  @UseGuards(GqlAuthGuard)
  async shipKitComplete(@CurrentUser() user: User) {
    return this.shipKitService.complete(user.id);
  }
}
