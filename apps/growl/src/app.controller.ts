import { Controller, Get, Param, Res, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('/:token')
  async main(
    @Param('token') token: string,
    @Res()
    res: Response,
    @Req() req: Request,
  ) {
    const userToken = await this.appService.findToken(token);
    const payload = { sub: userToken.userId };

    res.cookie('parachut-token', this.jwtService.sign(payload), {
      domain: 'parachut.co',
      secure: true,
    });

    res.redirect('https://beta.parachut.co/');
  }
}
