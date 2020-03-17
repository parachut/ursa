import {
  User,
  UserGeolocation,
  UserToken,
  Visit,
} from '@app/database/entities';
import { EmailService } from '@app/email';
import { TwilioService } from '@app/twilio';
import { Inject, Injectable } from '@nestjs/common';
import { Client as Authy } from 'authy-client';
import { Request } from 'express';
import randomWords from 'random-words';
import { Op } from 'sequelize';
import short from 'short-uuid';
import { v4 as uuidv4 } from 'uuid';
import PhoneNumber from 'awesome-phonenumber';

import { AuthenticateMethod } from './dto/authenticate-method.enum';

@Injectable()
export class AuthService {
  private readonly authyClient: any;
  private readonly userRepository: typeof User = this.sequelize.getRepository(
    'User',
  );
  private readonly userGeolocationRepository: typeof UserGeolocation = this.sequelize.getRepository(
    'UserGeolocation',
  );

  private readonly userTokenRepository: typeof UserToken = this.sequelize.getRepository(
    'UserToken',
  );

  private readonly visitRepository: typeof Visit = this.sequelize.getRepository(
    'Visit',
  );

  private readonly translator = short();

  constructor(
    @Inject('SEQUELIZE') private readonly sequelize,
    private readonly emailService: EmailService,
    private readonly twilioService: TwilioService,
  ) {
    this.authyClient = new Authy({ key: process.env.AUTHY });
  }

  private async getAuthyId(phone: string): Promise<[string, User]> {
    const user = await this.userRepository.findOne({
      where: { phone },
      include: ['integrations'],
    });

    if (!user) {
      throw new Error('No user with that phone number.');
    }

    const authyIntegration = user.integrations.find(
      integration => integration.type === 'AUTHY',
    );

    if (!authyIntegration) {
      throw new Error('User not registered with authy.');
    }

    return [authyIntegration.value, user];
  }

  async request(phone: string, method = AuthenticateMethod.SMS): Promise<any> {
    const [authyId] = await this.getAuthyId(phone);

    if (method === AuthenticateMethod.CALL) {
      return this.authyClient.requestCall({
        authyId,
      });
    }

    return this.authyClient.requestSms({
      authyId,
    });
  }

  async verify(phone: string, token: string): Promise<any> {
    const [authyId, user] = await this.getAuthyId(phone);

    await this.authyClient.verifyToken({
      authyId,
      token,
    });

    return user;
  }

  async growl(
    identifier: string,
    ipAddress: string,
    request: Request,
  ): Promise<UserToken> {
    let phone = identifier;
    try {
      const pn = new PhoneNumber(identifier, 'US');
      phone = pn.getNumber() || identifier;
    } catch (e) {}

    const user = await this.userRepository.findOne({
      where: {
        [Op.or]: [{ email: { [Op.iLike]: identifier } }, { phone }],
      },
    });

    const method =
      user.email.toLowerCase() === identifier.toLowerCase()
        ? AuthenticateMethod.EMAIL
        : AuthenticateMethod.SMS;

    if (user)
      if (!user) {
        throw new Error('No account exists with this identifier.');
      }

    const randomPhrase = randomWords({ exactly: 1, wordsPerString: 2 });

    const userToken = await this.userTokenRepository.create({
      userId: user.id,
      token: uuidv4(),
      randomPhrase: randomPhrase[0],
      method,
      ipAddress,
    } as UserToken);

    if (method === AuthenticateMethod.SMS) {
      await this.twilioService.sendMessage(
        `We have received a login attempt from ${request.header(
          'x-appengine-city',
        )}. To complete the login process, please follow the link below:`,
        user.phone,
      );

      await this.twilioService.sendMessage(
        'https://app.parachut.co/growl/' +
          this.translator.fromUUID(userToken.token),
        user.phone,
      );
    } else {
      await this.emailService.send({
        to: user.email,
        from: 'support@parachut.co',
        id: 15984570,
        data: {
          link:
            'https://app.parachut.co/growl/' +
            this.translator.fromUUID(userToken.token),
          email: user.email,
          city: request.header('x-appengine-city'),
        },
      });
    }

    return userToken;
  }

  async checkMobile(phone: string) {
    try {
      const phoneInformation = await this.authyClient.getPhoneInformation({
        countryCode: 'US',
        phone,
      });

      if (phoneInformation.type !== 'cellphone') {
        throw new Error('Phone number is not a cellphone.');
      }
    } catch (e) {
      throw e;
    }
  }

  async createGeolocation(
    user: User,
    request: Request,
  ): Promise<UserGeolocation> {
    if (request.header('x-appengine-citylatlong')) {
      const coordinates = request.header('x-appengine-citylatlong').split(',');

      return this.userGeolocationRepository.create({
        userId: user.id,
        countryCode: request.header('x-appengine-country'),
        regionCode: request.header('x-appengine-region'),
        city: request.header('x-appengine-city'),
        coordinates: {
          type: 'Point',
          coordinates: [
            parseInt(coordinates[1], 10),
            parseInt(coordinates[0], 10),
          ],
        },
      });
    }
  }

  async checkUserExists(phone: string, email: string): Promise<boolean> {
    const exists = await this.userRepository.count({
      where: { [Op.or]: [{ email }, { phone }] },
    });

    return !!exists;
  }

  async creditVisit(visitorId: string, userId: string) {
    const visit = await this.visitRepository.findByPk(visitorId);
    visit.userId = userId;
    return visit.save();
  }
}
