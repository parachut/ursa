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
import { UserService } from '../user/user.service';
import { AuthenticateInput } from './dto/authenticate.input';
import { RegisterInput } from './dto/register.input';
import { Token } from './dto/token.type';

// import { sendEmail } from '../utils/sendEmail';

@Resolver(Token)
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Mutation(() => Token)
  async authenticate(
    @Args('input') { passcode, method }: AuthenticateInput,
    @Phone() phone: string,
    @Context() ctx: ContextInterface,
  ): Promise<Token> {
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
          user,
        };
      }
    }
  }

  @Mutation(() => Token)
  async register(
    @Phone()
    phone: string,
    @Args('input')
    { email, name, marketingSource, roles }: RegisterInput,
    @Context() ctx: ContextInterface,
  ): Promise<Token> {
    // Find if there is an existing account
    const userExists = await this.authService.checkUserExists(phone, email);

    if (userExists) {
      throw new Error('Sorry, this user already exists, please try again.');
    }

    await this.authService.checkMobile(phone);

    const user = await this.userService.createUser(
      {
        email,
        phone,
        name,
      },
      roles,
      marketingSource,
    );

    await this.authService.createUserGeolocation(user, ctx.req);

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
      user,
    };
  }
}
