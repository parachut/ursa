import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppService } from './app.service';
import { LoginAsDto } from './dto/login-as.dto';
import { sign } from 'jsonwebtoken';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('/actions/login-as')
  async loginAs(@Body() loginAsDto: LoginAsDto) {
    const { ids } = loginAsDto.data.attributes;

    const user = await this.appService.findUser(ids[0]);

    const token = sign(
      {
        id: user.id,
        roles: user.roles,
      },
      'ysGEMzVN6MPbKTWXhuPt3dtwoE8GRJiCDNkctvUqZBUouhRq-Y',
    );

    return {
      success: 'Generated token success.',
      redirectTo:
        'https://www.parachut.co/?temp_token=' + encodeURIComponent(token),
    };
  }
}
