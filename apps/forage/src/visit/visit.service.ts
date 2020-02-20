import { Visit } from '@app/database/entities';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as short from 'short-uuid';
import { Request } from 'express';

@Injectable()
export class VisitService {
  private logger = new Logger(VisitService.name);

  private readonly visitRepository: typeof Visit = this.sequelize.getRepository(
    'Visit',
  );

  private readonly translator = short();

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

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
    marketingSource?: {
      campaign: string;
      source: string;
      medium: string;
    };
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

      try {
        return visit.save();
      } catch (e) {
        visit.affiliateId = null;
        return visit.save();
      }
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
}
