import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { IpAddress } from './ip-address.decorator';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/:program/:affiliateId')
  async main(
    @Param('program') program,
    @Param('affiliateId') affiliateId,
    @IpAddress() ipAddress: string,
    @Res()
    res: Response,
    @Req() req: Request,
  ) {
    const visitorId = req.cookies.parac_uid;

    const visit = await this.appService.recordVisit({
      visitorId,
      ipAddress,
      affiliateId,
      program,
      req,
    });

    if (visitorId === undefined) {
      // no: set a new cookie
      res.cookie(
        'parac_uid',
        visit.id,
        process.env.NODE_ENV === 'production'
          ? { domain: 'parachut.co', secure: true }
          : {},
      );
    }

    res.redirect(
      program === 'earn'
        ? 'https://parachut.co/earn?affiliate_id=' + affiliateId
        : 'https://unlimited.parachut.co?affiliate_id=' + affiliateId,
    );
  }
}
