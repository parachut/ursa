import { CartItem, Product, User } from '@app/database/entities';
import { Logger, UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Resolver,
  ResolveProperty,
  Parent,
} from '@nestjs/graphql';

import { CurrentUser } from '../current-user.decorator';
import { GqlAuthGuard } from '../gql-auth.guard';
import { CartItemService } from './cart-item.service';
import { CartItemCreateInput } from './dto/cart-item-create.input';
import { CartItemUpdateInput } from './dto/cart-item-update.input';
import { CartItemWhereUniqueInput } from './dto/cart-item-where-unique.input';

@Resolver(of => CartItem)
export class CartItemResolver {
  private readonly logger = new Logger(CartItemResolver.name);

  constructor(private readonly cartItemService: CartItemService) {}

  @Mutation(() => CartItem)
  @UseGuards(GqlAuthGuard)
  async cartItemCreate(
    @Args('input')
    input: CartItemCreateInput,
    @CurrentUser() user: User,
  ): Promise<CartItem> {
    return this.cartItemService.create(input, user.id);
  }

  @Mutation(() => CartItem)
  @UseGuards(GqlAuthGuard)
  async cartItemUpdate(
    @Args('where')
    { id }: CartItemWhereUniqueInput,
    @Args('input')
    { quantity }: CartItemUpdateInput,
    @CurrentUser() user: User,
  ): Promise<CartItem> {
    return this.cartItemService.update(id, quantity, user.id);
  }

  @Mutation(() => CartItem)
  @UseGuards(GqlAuthGuard)
  async cartItemDestroy(
    @Args('where')
    { id }: CartItemWhereUniqueInput,
    @Args('input')
    { quantity }: CartItemUpdateInput,
    @CurrentUser() user: User,
  ): Promise<CartItem> {
    return this.cartItemService.destroy(id, user.id);
  }

  @ResolveProperty(type => Product)
  async product(@Parent() cartItem: CartItem): Promise<Product> {
    return cartItem.$get('product');
  }
}
