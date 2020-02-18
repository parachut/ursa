import { Body, Controller, Post, UseGuards, Res, Get, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { LoginAsDto } from './dto/login-as.dto';
import { sign } from 'jsonwebtoken';
import { ShipKitDto } from './dto/ship-kit.dto'
import * as fs from 'fs'
import * as stringify from 'csv-stringify';
import * as tmp from 'tmp';

const columns = {
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  cartValue: 'Cart Value',
  cartItems: 'Cart Items',
  lastCartAdd: 'Last Cart Add',
  proximity: 'Proximity',
};
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(AuthGuard('jwt'))
  @Post('/actions/login-as')
  async loginAs(@Body() loginAsDto: LoginAsDto) {
    const { ids } = loginAsDto.data.attributes;

    const user = await this.userService.findUser(ids[0]);

    const token = sign(
      {
        sub: user.id,
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


  @UseGuards(AuthGuard('jwt'))
  @Post('/actions/export-proximity')
  async exportProximity(@Res() res: any): Promise<any> {

    const reports = await this.userService.exportProximity()

    stringify(
      reports,
      {
        header: true,
        columns,
      },
      function (err, data) {
        if (err) {
          return res.status(500).send(err);
        }
        tmp.file(function _tempFileCreated(err, path, fd) {
          if (err) throw err;

          fs.writeFileSync(path, data);
          const options = {
            dotfiles: 'deny',
            headers: {
              'Access-Control-Expose-Headers': 'Content-Disposition',
              'Content-Disposition':
                'attachment; filename="user-proximity.csv"',
            },
          };
          res.status(200).sendFile(path, options, (error) => {
            if (error) {
              throw error;
            }
          });
        });
      }
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/actions/create-shipkit')
  async createShipKit(@Body() shipKit: ShipKitDto) {

    const { ids } = shipKit.data.attributes;
    const attrs = shipKit.data.attributes.values;

    const airbox = Boolean(attrs['Airbox']);

    await this.userService.createShipKit(airbox, ids)

    return {
      success: 'Shipkit generated successfully.',
    };

  }





}
