import {
  Body,
  Controller,
  Res,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CancelCartDto } from './dto/cancel-cart.dto';
import { CartService } from './cart.service';
import * as fs from 'fs'
import * as stringify from 'csv-stringify';
import * as tmp from 'tmp';

const columns = {
  completedAt: 'Completed',
  shippedAt: 'Shipped',
  value: 'Value',
  items: 'Items',
  member: 'Member',
  createdAt: 'Cart Created',
};
@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @UseGuards(AuthGuard('jwt'))
  @Post('/actions/cancel-cart')
  async cartCart(@Body() cancelCartDto: CancelCartDto) {
    const { ids } = cancelCartDto.data.attributes;

    for (const id of ids) {
      await this.cartService.cancel(id);
    }

    return {
      success: 'Cart(s) are canceled!',
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/actions/confirm-cart')
  async confirmCart(@Body() cancelCartDto: CancelCartDto) {
    const { ids } = cancelCartDto.data.attributes;

    for (const id of ids) {
      await this.cartService.confirm(id);
    }

    return {
      success: 'Cart(s) are confirmed!',
    };
  }


  @UseGuards(AuthGuard('jwt'))
  @Post('/actions/export-all-history')
  async exportAllHistory(@Body() cancelCartDto: CancelCartDto, @Res() res): Promise<any> {

    const { ids } = cancelCartDto.data.attributes;

    const report = await this.cartService.exportHistory(ids)

    stringify(
      report,
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
                'attachment; filename="order-history.csv"',
            },
          };
          res.status(200).sendFile(path, options, (error) => {
            if (error) {
              throw error;
            }
          });
        });
      },
    );
    return {
      success: 'History Exported!',
    };
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('/actions/export-selected-history')
  async exportSelectedHistory(@Body() cancelCartDto: CancelCartDto, @Res() res): Promise<any> {

    const { ids } = cancelCartDto.data.attributes;

    const report = await this.cartService.exportHistory(ids)

    stringify(
      report,
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
                'attachment; filename="order-history.csv"',
            },
          };
          res.status(200).sendFile(path, options, (error) => {
            if (error) {
              throw error;
            }
          });
        });
      },
    );
    return {
      success: 'History Exported!',
    };
  }
}
