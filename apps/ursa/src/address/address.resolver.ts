import { Address } from '@app/database/entities/address.entity';
import { UserVerification } from '@app/database/entities/user-verification.entity';
import { User } from '@app/database/entities/user.entity';
import { UserRole } from '@app/database/enums/user-role.enum';
import { NotFoundException } from '@nestjs/common';
import { Client } from 'clearbit';
import {
  Arg,
  Authorized,
  Ctx,
  ID,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';

import { Context } from '../context.interface';
import { Phone } from '../phone.decorator';
import { AddressCreateInput } from './dto/address-create.input';
import { AddressUpdateInput } from './dto/address-update.input';
import { AddressWhereUniqueInput } from './dto/address-where-unique.input';

async function checkClearbitFraud(
  userId: string,
  zip: string,
  country = 'US',
  ipAddress = '0.0.0.0',
): Promise<Partial<UserVerification>> {
  const clearbit = new Client({ key: process.env.CLEARBIT });
  const user = await User.findByPk(userId);

  const result = await clearbit.Risk.calculate({
    country_code: country,
    email: user.email,
    ip: ipAddress,
    name: user.name,
    zip_code: zip,
  });

  return {
    type: 'CLEARBIT_FRAUD',
    verified: result.risk.level !== 'high',
    meta: JSON.stringify(result),
    userId: userId,
  };
}

@Resolver(Address)
export class AddressResolver {
  @Query(returns => Address)
  async address(@Arg('id', type => ID) id: string, @Ctx() ctx: Context) {
    const address = await Address.findOne({
      where: { id, userId: ctx.user.id },
    });

    if (!address) {
      throw new NotFoundException(id);
    }

    return address;
  }

  @Query(returns => [Address])
  async addresses(@Ctx() ctx: Context) {
    return Address.findAll({
      where: { userId: ctx.user.id },
    });
  }

  @Mutation(() => Address)
  async addressSetPrimary(
    @Arg('where')
    where: AddressWhereUniqueInput,
    @Ctx() ctx: Context,
  ) {
    await Address.update(
      {
        primary: false,
      },
      {
        where: {
          userId: ctx.user.id,
        },
      },
    );

    const address = await Address.findByPk(where.id);
    address.primary = true;

    return address.save();
  }

  @Mutation(() => Address)
  async addressCreate(
    @Phone() phone: string,
    @Arg('input')
    input: AddressCreateInput,
    @Ctx() ctx: Context,
  ) {
    const clearbitVerification = await checkClearbitFraud(
      ctx.user?.id,
      input.zip,
      input.country,
      ctx.req.header('X-Forwarded-For'),
    );

    await UserVerification.create(clearbitVerification);

    return Address.create({
      ...input,
      phone,
      userId: ctx.user?.id,
    });
  }

  @Mutation(() => Address)
  async addressUpdate(
    @Phone() phone: string,
    @Arg('input')
    input: AddressUpdateInput,
    @Arg('where')
    where: AddressWhereUniqueInput,
    @Ctx() ctx: Context,
  ) {
    const address = await Address.findByPk(where.id);

    const newAddress = await Address.create({
      ...address,
      ...input,
      phone,
      userId: ctx.user?.id,
    });

    await address.destroy();
    return newAddress;
  }

  @Mutation(() => Address)
  async addressDestroy(
    @Arg('where', type => AddressWhereUniqueInput)
    { id }: AddressWhereUniqueInput,
    @Ctx() ctx: Context,
  ) {
    const address = await Address.findOne({
      where: { id, userId: ctx.user?.id },
    });

    if (!address) {
      throw new Error('Address not found');
    }

    await address.destroy();

    return address;
  }
}
