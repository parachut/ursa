import { Inventory, User } from '@app/database/entities';
import { Logger, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../current-user.decorator';
import { GqlAuthGuard } from '../gql-auth.guard';
import { InventoryCreateInput } from './dto/inventory-create.input';
import { InventoryUpdateInput } from './dto/inventory-update.input';
import { InventoryWhereUniqueInput } from './dto/inventory-where-unique.input';
import { InventoryWhereInput } from './dto/inventory-where.input';
import { InventoryService } from './inventory.service';

@Resolver(of => Inventory)
export class InventoryResolver {
  private readonly logger = new Logger(InventoryResolver.name);

  constructor(private readonly inventoryService: InventoryService) {}

  @Query(type => Inventory)
  @UseGuards(GqlAuthGuard)
  async inventory(@Args('id') id: string, @CurrentUser() user: User) {
    return this.inventoryService.findOne(id, user.id);
  }

  @Query(returns => [Inventory])
  @UseGuards(GqlAuthGuard)
  async inventories(
    @Args('input')
    where: InventoryWhereInput,
    @CurrentUser() user: User,
  ) {
    return this.inventoryService.find(where, user.id);
  }

  @Mutation(returns => Inventory)
  @UseGuards(GqlAuthGuard)
  async inventoryCreate(
    @Args('input')
    input: InventoryCreateInput,
    @CurrentUser() user: User,
  ) {
    return this.inventoryService.create(input, user.id);
  }

  @Mutation(returns => Inventory)
  @UseGuards(GqlAuthGuard)
  async inventoryUpdate(
    @Args('where')
    { id }: InventoryWhereUniqueInput,
    @Args('input')
    input: InventoryUpdateInput,
    @CurrentUser() user: User,
  ) {
    return this.inventoryService.update(input, id, user.id);
  }

  @Mutation(returns => Inventory)
  @UseGuards(GqlAuthGuard)
  async inventoryReturn(
    @Args('where')
    { id }: InventoryWhereUniqueInput,
    @CurrentUser() user: User,
  ) {
    return this.inventoryService.markForReturn(id, user.id);
  }

  @Mutation(returns => Inventory)
  @UseGuards(GqlAuthGuard)
  async inventoryDestroy(
    @Args('where')
    { id }: InventoryWhereUniqueInput,
    @CurrentUser() user: User,
  ) {
    return this.inventoryService.destroy(id, user.id);
  }
}
