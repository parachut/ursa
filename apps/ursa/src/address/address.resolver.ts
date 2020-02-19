import { Address, User } from '@app/database/entities';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../current-user.decorator';
import { GqlAuthGuard } from '../gql-auth.guard';
import { IpAddress } from '../ip-address.decorator';
import { Phone } from '../phone.decorator';
import { AddressService } from './address.service';
import { AddressCreateInput } from './dto/address-create.input';
import { AddressUpdateInput } from './dto/address-update.input';
import { AddressWhereUniqueInput } from './dto/address-where-unique.input';

@Resolver(of => Address)
export class AddressResolver {
  constructor(private readonly addressService: AddressService) {}

  @Query(returns => Address)
  @UseGuards(GqlAuthGuard)
  async address(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<Address> {
    return this.addressService.findOne(id, user.id);
  }

  @Query(returns => Address, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async addressPrimary(@CurrentUser() user: User): Promise<Address> {
    return this.addressService.findPrimary(user.id);
  }

  @Query(returns => [Address])
  @UseGuards(GqlAuthGuard)
  async addresses(@CurrentUser() user: User): Promise<Address[]> {
    return this.addressService.find(user.id);
  }

  @Mutation(returns => Address)
  @UseGuards(GqlAuthGuard)
  async addressSetPrimary(
    @Args('where')
    { id }: AddressWhereUniqueInput,
    @CurrentUser() user: User,
  ): Promise<Address> {
    await this.addressService.setPrimary(id, user.id);
    return this.addressService.findOne(id, user.id);
  }

  @Mutation(returns => Address)
  @UseGuards(GqlAuthGuard)
  async addressCreate(
    @Phone() phone: string,
    @Args('input')
    input: AddressCreateInput,
    @CurrentUser() user: User,
    @IpAddress() ipAddress,
  ): Promise<Address> {
    return this.addressService.createAddress(
      { ...input, phone, userId: user.id },
      ipAddress,
    );
  }

  @Mutation(returns => Address)
  @UseGuards(GqlAuthGuard)
  async addressUpdate(
    @Phone() phone: string,
    @Args('input')
    input: AddressUpdateInput,
    @Args('where')
    { id }: AddressWhereUniqueInput,
    @CurrentUser() user: User,
    @IpAddress() ipAddress,
  ): Promise<Address> {
    const address = await this.addressService.createAddress(
      { ...input, phone, userId: user.id },
      ipAddress,
    );

    await this.addressService.deleteAddress(id, user.id);
    return address;
  }

  @Mutation(returns => Address)
  @UseGuards(GqlAuthGuard)
  async addressDestroy(
    @Args('where')
    { id }: AddressWhereUniqueInput,
    @CurrentUser() user: User,
  ): Promise<Address> {
    return this.addressService.deleteAddress(id, user.id);
  }
}
