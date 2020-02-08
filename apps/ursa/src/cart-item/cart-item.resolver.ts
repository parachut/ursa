import { CartItem, User } from '@app/database/entities';
import { Logger, UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveProperty,
  Resolver,
} from '@nestjs/graphql';

import { CartItemService } from './cart-item.service';
import { CurrentUser } from '../current-user.decorator';
import { GqlAuthGuard } from '../gql-auth.guard';
import { CartService } from '../cart/cart.service';
import { CartItemCreateInput } from './dto/cart-item-create.input';
import { CartItemUpdateInput } from './dto/cart-item-update.input';
import { CartItemWhereUniqueInput } from './dto/cart-item-where-unique.input';

@Resolver(of => CartItem)
export class CartItemResolver {
  private readonly logger = new Logger(CartItemResolver.name);

  constructor(
    private readonly cartService: CartService,
    private readonly cartItemService: CartItemService,
  ) {}

  @Mutation(() => CartItem)
  @UseGuards(GqlAuthGuard)
  async cartItemCreate(
    @Args('input')
    input: CartItemCreateInput,
    @CurrentUser() user: User,
  ) {
    return this.cartItemService.createCartItem(input, user.id);
  }

  @Mutation(() => CartItem)
  @UseGuards(GqlAuthGuard)
  async cartItemUpdate(
    @Args('where')
    { id }: CartItemWhereUniqueInput,
    @Args('input')
    { quantity }: CartItemUpdateInput,
    @CurrentUser() user: User,
  ) {
    return this.cartItemService.updateCartItem(id, quantity, user.id);
  }

  @Mutation(() => CartItem)
  @UseGuards(GqlAuthGuard)
  async cartItemDestroy(
    @Args('where')
    { id }: CartItemWhereUniqueInput,
    @Args('input')
    { quantity }: CartItemUpdateInput,
    @CurrentUser() user: User,
  ) {
    return this.cartItemService.destroyCartItem(id, user.id);
  }
}
