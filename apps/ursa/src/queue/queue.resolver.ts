import { Product, Queue, User } from '@app/database/entities';
import { Logger, UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveProperty,
  Resolver,
} from '@nestjs/graphql';

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
  async queue(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<Queue> {
    return this.queueService.findOne(id, user.id);
  }

  @Query(returns => [Queue])
  @UseGuards(GqlAuthGuard)
  async queues(@CurrentUser() user: User): Promise<Queue[]> {
    return this.queueService.find(user.id);
  }

  @Mutation(returns => Queue)
  @UseGuards(GqlAuthGuard)
  async queueCreate(
    @Args('input')
    { productId }: QueueCreateInput,
    @CurrentUser() user: User,
  ): Promise<Queue> {
    return this.queueService.create(productId, user.id);
  }

  @Mutation(returns => Queue)
  @UseGuards(GqlAuthGuard)
  async queueDestroy(
    @Args('where')
    { id }: QueueWhereUniqueInput,
    @CurrentUser() user: User,
  ): Promise<Queue> {
    return this.queueService.destroy(id, user.id);
  }

  @ResolveProperty(type => Product)
  async product(@Parent() queue: Queue): Promise<Product> {
    return queue.$get('product');
  }
}
