import { AffiliateLink } from '@app/database/entities';
import { AffiliateLinkType } from '@app/database/enums';
import { Inject, Injectable } from '@nestjs/common';
import Rebrandly from 'rebrandly';
import short from 'short-uuid';

@Injectable()
export class AffiliateLinkService {
  private readonly affiliateLinkRepository: typeof AffiliateLink = this.sequelize.getRepository(
    'AffiliateLink',
  );

  private readonly rebrandlyClient = new Rebrandly({
    apikey: process.env.REBRANDLY,
  });

  private readonly translator = short();

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  async findOne(type: AffiliateLinkType, userId: string) {
    const link = await this.affiliateLinkRepository.findOne({
      where: {
        userId,
        type,
      },
    });

    if (!link) {
      const rebrandlyLink = await this.rebrandlyClient.links.create({
        destination: `https://unlimited.parachut.co/${type}/?affiliate_id=${this.translator.fromUUID(
          userId,
        )}`,
        domain: {
          id: '870f873352f641d1b4e1cfe1d4db3e6b',
        },
        title: `${userId} ${String(type)} Affilliate Link`,
      });
      return this.affiliateLinkRepository.create({
        userId,
        type,
        link: `https://par.ac/${rebrandlyLink.slashtag}`,
        rebrandlyId: rebrandlyLink.id,
      });
    }

    return link;
  }
}
