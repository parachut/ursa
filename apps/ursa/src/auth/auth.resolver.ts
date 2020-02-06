import { UserGeolocation } from '@app/database/entities';
import { UserMarketingSource } from '@app/database/entities';
import { UserTermAgreement } from '@app/database/entities';
import { User } from '@app/database/entities';
import { UserRole } from '@app/database/enums/user-role.enum';
import { JwtService } from '@nestjs/jwt';
import { Op } from 'sequelize';
import { Args, Mutation, Query, Resolver, Context } from '@nestjs/graphql';
import { Logger } from '@nestjs/common';

import { Context as ContextInterface } from '../context.interface';
import { Phone } from '../phone.decorator';
import { AuthService } from './auth.service';
import { AuthenticateInput } from './dto/authenticate.input';
import { RegisterInput } from './dto/register.input';
import { Token } from './dto/token.type';

// import { sendEmail } from '../utils/sendEmail';

@Resolver(Token)
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);

  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Mutation(() => Token)
  async authenticate(
    @Args('input') { passcode, method }: AuthenticateInput,
    @Phone() phone: string,
    @Context() ctx: ContextInterface,
  ) {
    if (!passcode) {
      await this.authService.request(phone, method);

      return {
        token: null,
      };
    } else {
      const user = await this.authService.verify(phone, passcode);

      if (user) {
        await this.authService.createUserGeolocation(user, ctx.req);

        const payload = { sub: user.id };

        return {
          token: this.jwtService.sign(payload),
        };
      }
    }
  }

  @Mutation(() => UserTermAgreement)
  async agreeToTerms(
    @Args('type') type: string,
    @Context() ctx: ContextInterface,
  ) {
    if (ctx.user) {
      const agree = new UserTermAgreement({
        type,
        agreed: true,
        userId: ctx.user.id,
      });

      await agree.save();

      return agree;
    }

    throw new Error('Unauthorized');
  }

  @Mutation(() => Token)
  async register(
    @Phone()
    phone: string,
    @Args('input')
    { email, name, marketingSource, roles }: RegisterInput,
    @Context() ctx: ContextInterface,
  ) {
    // Find if there is an existing account
    const userExists = await User.findOne({
      where: { [Op.or]: [{ email }, { phone }] },
    });

    if (userExists) {
      throw new Error('Sorry, this user already exists, please try again.');
    }

    await this.authService.checkMobile(phone);

    const filteredRoles =
      roles && roles.length
        ? roles.filter(role =>
            [UserRole.CONTRIBUTOR, UserRole.MEMBER].includes(role),
          )
        : [UserRole.MEMBER];

    const user = await User.create({
      email,
      name,
      phone,
      roles: filteredRoles,
    });

    const agree = new UserTermAgreement({
      type: roles && roles.length > 1 ? 'EARN' : 'ACCESS',
      agreed: true,
      userId: user.get('id'),
    });

    await agree.save();

    if (marketingSource) {
      await UserMarketingSource.create({
        ...marketingSource,
        userId: user.get('id'),
      });
    }

    if (ctx.req.header('X-AppEngine-CityLatLong')) {
      const coordinates = ctx.req.header('X-AppEngine-CityLatLong').split(',');

      await UserGeolocation.create({
        userId: user.id,
        countryCode: ctx.req.header('X-AppEngine-Country'),
        regionCode: ctx.req.header('X-AppEngine-Region'),
        city: ctx.req.header('X-AppEngine-City'),
        coordinates: {
          type: 'Point',
          coordinates: [
            parseInt(coordinates[1], 10),
            parseInt(coordinates[0], 10),
          ],
        },
      } as UserGeolocation);
    }

    /* await sendEmail({
      to: user.email,
      id: filteredRoles.includes(UserRole.CONTRIBUTOR) ? 13193333 : 13136612,
      data: {
        name: user.parsedName.first,
      },
    }); */

    const payload = { sub: user.id };

    return {
      token: this.jwtService.sign(payload),
    };
  }
}
