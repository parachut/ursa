import { Queue, User } from '@app/database/entities';
import { Logger, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../current-user.decorator';
import { GqlAuthGuard } from '../gql-auth.guard';
import { QueueCreateInput } from './dto/queue-create.input';
import { QueueWhereUniqueInput } from './dto/queue-where-unique.input';
import { QueueService } from './queue.service';

@Resolver(of => Queue)
export class QueueResolver {
  private readonly logger = new Logger(QueueResolver.name);

  constructor(private readonly queueService: QueueService) {}

  @Query(type => Queue)
  @UseGuards(GqlAuthGuard)
  async inventory(@Args('id') id: string, @CurrentUser() user: User) {
    return this.queueService.findOne(id, user.id);
  }

  @Query(returns => [Queue])
  @UseGuards(GqlAuthGuard)
  async inventories(@CurrentUser() user: User) {
    return this.queueService.find(user.id);
  }

  @Mutation(returns => Queue)
  @UseGuards(GqlAuthGuard)
  async inventoryCreate(
    @Args('input')
    { productId }: QueueCreateInput,
    @CurrentUser() user: User,
  ) {
    return this.queueService.create(productId, user.id);
  }

  @Mutation(returns => Queue)
  @UseGuards(GqlAuthGuard)
  async queueDestroy(
    @Args('input')
    { id }: QueueWhereUniqueInput,
    @CurrentUser() user: User,
  ) {
    return this.queueService.destroy(id, user.id);
  }
}
