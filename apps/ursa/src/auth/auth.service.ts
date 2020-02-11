import { User, UserGeolocation, Visit } from '@app/database/entities';
import { Inject, Injectable } from '@nestjs/common';
import { Client as Authy } from 'authy-client';
import { Request } from 'express';
import { Op } from 'sequelize';
import * as short from 'short-uuid';

import { AuthenticateMethod } from './dto/authenticate-method.enum';
import { MarketingSourceInput } from './dto/marketing-source.input';

@Injectable()
export class AuthService {
  private readonly authyClient: any;
  private readonly userRepository: typeof User = this.sequelize.getRepository(
    'User',
  );
  private readonly userGeolocationRepository: typeof UserGeolocation = this.sequelize.getRepository(
    'UserGeolocation',
  );

  private readonly visitRepository: typeof Visit = this.sequelize.getRepository(
    'Visit',
  );

  private readonly translator = short();

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {
    this.authyClient = new Authy({ key: process.env.AUTHY });

    console.log(
      this.translator.fromUUID('85387f41-9c29-4602-8bd2-cf374d920ff8'),
    );
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

  async recordVisit({
    visitorId,
    deviceId,
    ipAddress,
    req,
    affiliateId,
    userId,
    marketingSource,
  }: {
    visitorId?: string;
    deviceId: string;
    ipAddress: string;
    req: Request;
    affiliateId?: string;
    userId?: string;
    marketingSource?: MarketingSourceInput;
  }): Promise<Visit> {
    let visit = visitorId
      ? await this.visitRepository.findByPk(visitorId)
      : await this.visitRepository.findOne({
          where: {
            deviceId,
            ipAddress,
          },
        });

    const _affiliateId = affiliateId
      ? this.translator.toUUID(affiliateId)
      : null;

    if (!visit) {
      visit = this.visitRepository.build({
        affiliateId: _affiliateId,
        userId,
        ipAddress,
        deviceId,
      });

      if (req.header('x-appengine-citylatlong')) {
        const coordinates = req.header('x-appengine-citylatlong').split(',');

        visit.countryCode = req.header('x-appengine-country');
        visit.regionCode = req.header('x-appengine-region');
        visit.city = req.header('x-appengine-city');
        visit.coordinates = {
          type: 'Point',
          coordinates: [
            parseInt(coordinates[1], 10),
            parseInt(coordinates[0], 10),
          ],
        };
      }

      return visit.save();
    }

    if (!visit.affiliateId && _affiliateId) {
      visit.affiliateId = _affiliateId;
    }

    if (
      (!visit.campaign || !visit.source || !visit.medium) &&
      marketingSource
    ) {
      visit.campaign = marketingSource.campaign;
      visit.source = marketingSource.source;
      visit.medium = marketingSource.medium;
    }
    if (visit.changed()) {
      try {
        await visit.save();
        return visit;
      } catch (e) {
        console.log(e);
        return visit;
      }
    } else {
      return visit;
    }
  }

  async creditVisit(visitorId: string, userId: string) {
    const visit = await this.visitRepository.findByPk(visitorId);
    visit.userId = userId;
    return visit.save();
  }
}
