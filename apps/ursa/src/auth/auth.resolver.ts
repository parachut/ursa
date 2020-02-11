import { User, Visit } from '@app/database/entities';
import { UserRole } from '@app/database/enums';
import { Logger } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';

import { Context as ContextInterface } from '../context.interface';
import { CurrentUser } from '../current-user.decorator';
import { EmailService } from '../email.service';
import { IpAddress } from '../ip-address.decorator';
import { Phone } from '../phone.decorator';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { AuthenticateInput } from './dto/authenticate.input';
import { RegisterInput } from './dto/register.input';
import { Token } from './dto/token.type';
import { VisitCreateInput } from './dto/visit-create.input';

@Resolver(of => Token)
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);

  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Mutation(returns => Token)
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
        await this.authService.createGeolocation(user, ctx.req);

        const payload = { sub: user.id };

        return {
          token: this.jwtService.sign(payload),
          user,
        };
      }
    }
  }

  @Mutation(returns => Visit)
  async visitCreate(
    @Args('input')
    { affiliateId, deviceId, marketingSource, visitorId }: VisitCreateInput,
    @IpAddress() ipAddress: string,
    @CurrentUser() user: User,
    @Context() ctx: ContextInterface,
  ): Promise<Visit> {
    return this.authService.recordVisit({
      visitorId,
      deviceId,
      ipAddress,
      req: ctx.req,
      affiliateId,
      userId: user?.id,
      marketingSource,
    });
  }

  @Mutation(returns => Token)
  async register(
    @Phone()
    phone: string,
    @Args('input')
    { email, name, marketingSource, roles, visitorId }: RegisterInput,
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

    if (visitorId) {
      await this.authService.creditVisit(visitorId, user.id);
    }

    await this.authService.createGeolocation(user, ctx.req);

    await this.emailService.send({
      to: user.email,
      id: user.roles.includes(UserRole.CONTRIBUTOR) ? 13193333 : 13136612,
      data: {
        name: user.parsedName.first,
      },
    });

    const payload = { sub: user.id };

    return {
      token: this.jwtService.sign(payload),
      user,
    };
  }
}
