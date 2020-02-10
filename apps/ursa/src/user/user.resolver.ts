import {
  BillingInfo,
  Inventory,
  User,
  UserFunds,
  UserTermAgreement,
} from '@app/database/entities';
import * as crypto from 'crypto';
import { Logger, UseGuards } from '@nestjs/common';
import {
  Parent,
  Query,
  Args,
  ResolveProperty,
  Resolver,
  Mutation,
} from '@nestjs/graphql';

import { BillingInfoUpdateInput } from './dto/billing-info-update.input';
import { CurrentUser } from '../current-user.decorator';
import { GqlAuthGuard } from '../gql-auth.guard';
import { UserService } from './user.service';

@Resolver(User)
export class UserResolver {
  private readonly logger = new Logger(UserResolver.name);

  constructor(private readonly userService: UserService) {}

  @Query(type => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return this.userService.findOne(user.id);
  }

  @Mutation(type => BillingInfo)
  @UseGuards(GqlAuthGuard)
  async updateBillingInfo(
    @Args('input') { token }: BillingInfoUpdateInput,
    @CurrentUser() user: User,
  ): Promise<BillingInfo> {
    return this.userService.updateBillingInfo(token, user.id);
  }

  @ResolveProperty(type => [Inventory])
  async currentInventory(@Parent() user: User): Promise<Inventory[]> {
    return user.$get('currentInventory');
  }

  @ResolveProperty(type => [Inventory])
  async inventory(@Parent() user: User): Promise<Inventory[]> {
    return user.$get('inventory');
  }

  @ResolveProperty(type => [Inventory])
  async termAgreements(@Parent() user: User): Promise<UserTermAgreement[]> {
    return user.$get('termAgreements');
  }

  @ResolveProperty(type => UserFunds)
  async funds(@Parent() user: User): Promise<UserFunds> {
    return user.$get('funds');
  }

  @ResolveProperty(type => BillingInfo)
  async billingInfo(@Parent() user: User): Promise<BillingInfo> {
    return user.$get('billingInfo');
  }

  @ResolveProperty(type => String)
  frontHash(@Parent() user: User): string {
    return crypto
      .createHmac('sha256', process.env.FRONT_CHAT_SECRET)
      .update(user.email)
      .digest('hex');
  }
}
