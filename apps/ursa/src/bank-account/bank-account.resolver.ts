import { User, UserBankAccount } from '@app/database/entities';
import { Logger, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../current-user.decorator';
import { GqlAuthGuard } from '../gql-auth.guard';
import { IpAddress } from '../ip-address.decorator';
import { BankAccountService } from './bank-account.service';
import { BankAccountCreateInput } from './dto/bank-account-create.input';

@Resolver(of => UserBankAccount)
export class BankAccountResolver {
  private readonly logger = new Logger(BankAccountResolver.name);

  constructor(private readonly bankAccountService: BankAccountService) {}

  @Query(type => UserBankAccount)
  @UseGuards(GqlAuthGuard)
  async bankAccount(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<UserBankAccount> {
    return this.bankAccountService.findOne(id, user.id);
  }

  @Query(type => [UserBankAccount])
  @UseGuards(GqlAuthGuard)
  async bankAccounts(@CurrentUser() user: User): Promise<UserBankAccount[]> {
    return this.bankAccountService.find(user.id);
  }

  @Mutation(type => UserBankAccount)
  @UseGuards(GqlAuthGuard)
  async bankAccountCreate(
    @Args('input')
    { token, accountId }: BankAccountCreateInput,
    @CurrentUser() user: User,
    @IpAddress() ipAddress,
  ): Promise<UserBankAccount> {
    return this.bankAccountService.create(token, accountId, user.id, ipAddress);
  }
}
