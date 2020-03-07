import {
  Address,
  Inventory,
  Return,
  Shipment,
  User,
} from '@app/database/entities';
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
import { ReturnService } from './return.service';
import { ReturnCompleteInput } from './dto/return-complete.input';

@Resolver(of => Return)
export class ReturnResolver {
  private readonly logger = new Logger(ReturnResolver.name);

  constructor(private readonly returnService: ReturnService) {}

  @Query(type => Return)
  @UseGuards(GqlAuthGuard)
  async return(@CurrentUser() user: User): Promise<Return> {
    return this.returnService.findOne(user.id);
  }

  @Query(returns => [Return])
  @UseGuards(GqlAuthGuard)
  async returns(@CurrentUser() user: User): Promise<Return[]> {
    return this.returnService.find(user.id);
  }

  @Mutation(returns => Return)
  @UseGuards(GqlAuthGuard)
  async returnComplete(
    @Args('input')
    input: ReturnCompleteInput,
    @CurrentUser() user: User,
  ): Promise<Return> {
    return this.returnService.complete(input.inventoryIds, user.id);
  }

  @ResolveProperty(type => [Inventory])
  async inventory(@Parent() _return: Return): Promise<Inventory[]> {
    return _return.$get('inventory');
  }

  @ResolveProperty(type => Address)
  async address(@Parent() _return: Return): Promise<Address> {
    return _return.$get('address');
  }

  @ResolveProperty(type => [Shipment])
  async shipments(@Parent() _return: Return): Promise<Shipment[]> {
    return _return.$get('shipments');
  }
}
