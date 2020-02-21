import {
  BillingInfo,
  Inventory,
  User,
  UserFunds,
  UserTermAgreement,
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
import crypto from 'crypto';

import { CurrentUser } from '../current-user.decorator';
import { GqlAuthGuard } from '../gql-auth.guard';
import { BillingInfoUpdateInput } from './dto/billing-info-update.input';
import { SubscriptionInfo } from './dto/subscription-info.type';
import { AgreeToTermsInput } from './dto/agree-to-terms.input';
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

  @Mutation(type => UserTermAgreement)
  @UseGuards(GqlAuthGuard)
  async agreeToTerms(
    @Args('input') { type }: AgreeToTermsInput,
    @CurrentUser() user: User,
  ): Promise<UserTermAgreement> {
    return this.userService.agreeToTerms(user.id, type);
  }

  @ResolveProperty(type => [Inventory])
  async currentInventory(@Parent() user: User): Promise<Inventory[]> {
    return user.$get('currentInventory');
  }

  @ResolveProperty(type => [Inventory])
  async inventory(@Parent() user: User): Promise<Inventory[]> {
    return user.$get('inventory');
  }

  @ResolveProperty(type => [UserTermAgreement])
  async termAgreements(@Parent() user: User): Promise<UserTermAgreement[]> {
    return user.$get('termAgreements');
  }

  @ResolveProperty(type => UserFunds)
  async funds(@Parent() user: User): Promise<UserFunds> {
    return user.$get('funds');
  }

  @ResolveProperty(type => SubscriptionInfo, { nullable: true })
  async subscription(@Parent() user: User): Promise<SubscriptionInfo | null> {
    return this.userService.subscription(user);
  }

  @ResolveProperty(type => BillingInfo, { nullable: true })
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

  @ResolveProperty(type => String)
  shortId(@Parent() user: User): string {
    return this.userService.shortId(user.id);
  }
}
