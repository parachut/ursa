import { Cart, CartItem, User } from '@app/database/entities';
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
  async cart(@Args('id') id: string, @CurrentUser() user: User) {
    return this.cartService.findOne(user.id);
  }

  @Query(type => [Cart])
  @UseGuards(GqlAuthGuard)
  async carts(@CurrentUser() user: User) {
    return this.cartService.find(user.id);
  }

  @Mutation(type => Cart)
  @UseGuards(GqlAuthGuard)
  async cartCancel(
    @Args('where')
    { id }: CartWhereUniqueInput,
    @CurrentUser() user: User,
  ) {
    return this.cartService.cancelCart(id, user.id);
  }

  @Mutation(type => Cart)
  @UseGuards(GqlAuthGuard)
  async cartUpdate(
    @Args('input')
    input: CartUpdateInput,
    @CurrentUser() user: User,
  ) {
    return this.cartService.updateCart(input, user.id);
  }

  @ResolveProperty(type => [CartItem])
  async items(@Parent() cart: Cart) {
    return this.cartItemService.find(cart.id);
  }
}
