import {
  Address,
  Cart,
  CartItem,
  Inventory,
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

import { CartItemService } from '../cart-item/cart-item.service';
import { CurrentUser } from '../current-user.decorator';
import { GqlAuthGuard } from '../gql-auth.guard';
import { CartService } from './cart.service';
import { CartUpdateInput } from './dto/cart-update.input';
import { CartWhereUniqueInput } from './dto/cart-where-unique.input';

@Resolver(of => Cart)
export class CartResolver {
  private readonly logger = new Logger(CartResolver.name);

  constructor(
    private readonly cartService: CartService,
    private readonly cartItemService: CartItemService,
  ) {}

  @Query(type => Cart)
  @UseGuards(GqlAuthGuard)
  async cart(@Args('id') id: string, @CurrentUser() user: User): Promise<Cart> {
    return this.cartService.findOne(user.id);
  }

  @Query(type => [Cart])
  @UseGuards(GqlAuthGuard)
  async carts(@CurrentUser() user: User): Promise<Cart[]> {
    return this.cartService.find(user.id);
  }

  @Mutation(type => Cart)
  @UseGuards(GqlAuthGuard)
  async cartCancel(
    @Args('where')
    { id }: CartWhereUniqueInput,
    @CurrentUser() user: User,
  ): Promise<Cart> {
    return this.cartService.cancel(id, user.id);
  }

  @Mutation(type => Cart)
  @UseGuards(GqlAuthGuard)
  async cartUpdate(
    @Args('input')
    input: CartUpdateInput,
    @CurrentUser() user: User,
  ): Promise<Cart> {
    return this.cartService.update(input, user.id);
  }

  @ResolveProperty(type => [CartItem])
  async items(@Parent() cart: Cart): Promise<CartItem[]> {
    return cart.$get('items');
  }

  @ResolveProperty(type => [CartItem])
  async inventory(@Parent() cart: Cart): Promise<Inventory[]> {
    return cart.$get('inventory');
  }

  @ResolveProperty(type => Address)
  async address(@Parent() cart: Cart): Promise<Address> {
    return cart.$get('address');
  }

  @ResolveProperty(type => [Shipment])
  async shipments(@Parent() cart: Cart): Promise<Shipment[]> {
    return cart.$get('shipments');
  }
}
