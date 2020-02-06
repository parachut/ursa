import { User, UserGeolocation } from '@app/database/entities';
import { Inject, Injectable } from '@nestjs/common';
import { Client as Authy } from 'authy-client';
import { Request } from 'express';
import { Op } from 'sequelize';

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

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {
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

    console.log(authyId);

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
}
