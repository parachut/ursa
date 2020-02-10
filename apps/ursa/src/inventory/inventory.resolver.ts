import {
  Cart,
  Inventory,
  Product,
  Shipment,
  InventoryIncome,
  User,
} from '@app/database/entities';
import { ShipmentDirection } from '@app/database/enums';
import { Logger, UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveProperty,
  Resolver,
} from '@nestjs/graphql';

import { CartService } from '../cart/cart.service';
import { CurrentUser } from '../current-user.decorator';
import { GqlAuthGuard } from '../gql-auth.guard';
import { ShipmentService } from '../shipment/shipment.service';
import { InventoryCreateInput } from './dto/inventory-create.input';
import { InventoryUpdateInput } from './dto/inventory-update.input';
import { InventoryHistory } from './dto/inventory-history.type';
import { InventoryWhereUniqueInput } from './dto/inventory-where-unique.input';
import { InventoryWhereInput } from './dto/inventory-where.input';
import { InventoryService } from './inventory.service';

@Resolver(of => Inventory)
export class InventoryResolver {
  private readonly logger = new Logger(InventoryResolver.name);

  constructor(
    private readonly inventoryService: InventoryService,
    private readonly cartService: CartService,
    private readonly shipmentService: ShipmentService,
  ) {}

  @Query(type => Inventory)
  @UseGuards(GqlAuthGuard)
  async inventoryItem(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<Inventory> {
    return this.inventoryService.findOne(id, user.id);
  }

  @Query(returns => [Inventory])
  @UseGuards(GqlAuthGuard)
  async inventory(
    @Args({ name: 'where', type: () => InventoryWhereInput, nullable: true })
    where: InventoryWhereInput,
    @CurrentUser() user: User,
  ): Promise<Inventory[]> {
    return this.inventoryService.find(where, user.id);
  }

  @Mutation(returns => Inventory)
  @UseGuards(GqlAuthGuard)
  async inventoryCreate(
    @Args('input')
    input: InventoryCreateInput,
    @CurrentUser() user: User,
  ): Promise<Inventory> {
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
  ): Promise<Inventory> {
    return this.inventoryService.update(input, id, user.id);
  }

  @Mutation(returns => Inventory)
  @UseGuards(GqlAuthGuard)
  async inventoryReturn(
    @Args('where')
    { id }: InventoryWhereUniqueInput,
    @CurrentUser() user: User,
  ): Promise<Inventory> {
    return this.inventoryService.markForReturn(id, user.id);
  }

  @Mutation(returns => Inventory)
  @UseGuards(GqlAuthGuard)
  async inventoryDestroy(
    @Args('where')
    { id }: InventoryWhereUniqueInput,
    @CurrentUser() user: User,
  ): Promise<Inventory> {
    return this.inventoryService.destroy(id, user.id);
  }

  @ResolveProperty(type => InventoryIncome, { nullable: true })
  async income(@Parent() inventory: Inventory): Promise<InventoryIncome> {
    return inventory.$get('income');
  }

  @ResolveProperty(type => [InventoryHistory])
  async history(@Parent() inventory: Inventory): Promise<InventoryHistory[]> {
    return this.inventoryService.history(inventory.id);
  }

  @ResolveProperty(type => Product)
  async product(@Parent() inventory: Inventory): Promise<Product> {
    return inventory.$get('product');
  }

  @ResolveProperty(type => Cart)
  async lastCart(@Parent() inventory: Inventory): Promise<Cart> {
    return this.cartService.lastByInventory(inventory.id);
  }

  @ResolveProperty(type => Cart)
  async lastReturn(@Parent() inventory: Inventory): Promise<Shipment> {
    return this.shipmentService.lastByInventory(
      inventory.id,
      ShipmentDirection.INBOUND,
    );
  }

  @ResolveProperty(type => Cart)
  async lastShipment(@Parent() inventory: Inventory): Promise<Shipment> {
    return this.shipmentService.lastByInventory(
      inventory.id,
      ShipmentDirection.OUTBOUND,
    );
  }
}
