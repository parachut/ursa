import { UserRole } from '@app/database/enums';
import { Logger } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';

import { Context as ContextInterface } from '../context.interface';
import { EmailService } from '../email.service';
import { Phone } from '../phone.decorator';
import { SlackService } from '../slack.service';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { AuthenticateInput } from './dto/authenticate.input';
import { RegisterAffiliateInput } from './dto/register-affiliate.input';
import { RegisterInput } from './dto/register.input';
import { Token } from './dto/token.type';

@Resolver(of => Token)
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);

  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly slackService: SlackService,
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

  @Mutation(returns => Token)
  async registerAffiliate(
    @Phone()
    phone: string,
    @Args('input')
    input: RegisterAffiliateInput,
    @Context() ctx: ContextInterface,
  ): Promise<Token> {
    const userExists = await this.authService.checkUserExists(
      phone,
      input.email,
    );

    if (!userExists) {
      await this.userService.createUser(
        {
          email: input.email,
          phone,
          name: input.first + input.last,
          site: input.website,
          location: input.location,
          businessName: input.businessName,
        },
        [UserRole.MEMBER],
      );
    }

    await this.emailService.send({
      to: input.email,
      from: 'support@parachut.co',
      id: 16463454,
      data: input,
    });

    await this.slackService.affiliateMessage(input);

    return {
      token: null,
    };
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
