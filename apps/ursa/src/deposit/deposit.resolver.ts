import { Deposit, User } from '@app/database/entities';
import { Logger, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../current-user.decorator';
import { GqlAuthGuard } from '../gql-auth.guard';
import { DepositService } from './deposit.service';
import { DepositCreateInput } from './dto/deposit-create.input';

@Resolver(of => Deposit)
export class DepositResolver {
  private readonly logger = new Logger(DepositResolver.name);

  constructor(private readonly depositService: DepositService) {}

  @Query(type => Deposit)
  @UseGuards(GqlAuthGuard)
  async deposit(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<Deposit> {
    return this.depositService.findOne(id, user.id);
  }

  @Query(type => [Deposit])
  @UseGuards(GqlAuthGuard)
  async deposits(@CurrentUser() user: User): Promise<Deposit[]> {
    return this.depositService.find(user.id);
  }

  @Mutation(() => Deposit)
  @UseGuards(GqlAuthGuard)
  async depositCreate(
    @Args('input')
    { amount }: DepositCreateInput,
    @CurrentUser() user: User,
  ): Promise<Deposit> {
    return this.depositService.create(amount, user.id);
  }
}
