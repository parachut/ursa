import { Body, Controller, Res, Post, UseGuards, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InventoryService } from './invetory.service';
import { InventoryDto } from './dto/inventory.dto';
import { startOfDay, endOfDay } from 'date-fns';
import Liana from 'forest-express-sequelize';
import fs from 'fs';
import stringify from 'csv-stringify';
import tmp from 'tmp';

const columns = {
  value: 'Product Value',
  total: 'Actual Total',
  serial: 'Serial',
  name: 'Product Name',
  contributorName: 'Contributor Name',
  contributorPhone: 'Contributor Phone',
  contributorEmail: 'Contributor Email',
  daysInCirculation: 'Days In Circulation',
};
@Controller()
export class InventoryController {
  private logger = new Logger('InventoryController');

  constructor(private readonly inventoryService: InventoryService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('/stats/inventory-status-points')
  async statInventoryPoint(@Res() res) {
    const inventory: any = await this.inventoryService.findInventoryStatusPoint();
    const json = new Liana.StatSerializer({
      value: inventory,
    }).perform();

    res.status(200).send(json);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/actions/export-all-commissions')
  async exportAll(
    @Body() inventoryDto: InventoryDto,
    @Res() res,
  ): Promise<any> {
    const { ids } = inventoryDto.data.attributes;
    const attrs = inventoryDto.data.attributes.values;
    const startDate = startOfDay(new Date(attrs['Start date']));
    const endDate = endOfDay(new Date(attrs['End date']));

    const report = await this.inventoryService.exportCommissions(
      startDate,
      endDate,
      ids,
    );

    try {
      stringify(
        report.filter(item => item.total !== '$0.00'),
        {
          header: true,
          columns,
        },
        function(err, data) {
          if (err) {
            return res.status(500).send(err);
          }

          tmp.file(function _tempFileCreated(err, path, fd) {
            if (err) {
              throw err;
            }

            fs.writeFileSync(path, data);

            const options = {
              dotfiles: 'deny',
              headers: {
                'Access-Control-Expose-Headers': 'Content-Disposition',
                'Content-Disposition': 'attachment; filename="commissions.csv"',
              },
            };

            res.status(200).sendFile(path, options, error => {
              if (error) {
                throw error;
              }
            });
          });
        },
      );
      return {
        success: 'Commissions Exported!',
      };
    } catch (e) {
      this.logger.error(`Did not export commissions `, e.stack);
    }
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('/actions/export-selected-commissions')
  async exportSelected(
    @Body() inventoryDto: InventoryDto,
    @Res() res,
  ): Promise<any> {
    const { ids } = inventoryDto.data.attributes;
    const attrs = inventoryDto.data.attributes.values;
    const startDate = startOfDay(new Date(attrs['Start date']));
    const endDate = endOfDay(new Date(attrs['End date']));

    const report = await this.inventoryService.exportCommissions(
      startDate,
      endDate,
      ids,
    );
    try {
      stringify(
        report.filter(item => item.total !== '$0.00'),
        {
          header: true,
          columns,
        },
        function(err, data) {
          if (err) {
            return res.status(500).send(err);
          }

          tmp.file(function _tempFileCreated(err, path, fd) {
            if (err) {
              throw err;
            }

            fs.writeFileSync(path, data);
            const options = {
              dotfiles: 'deny',
              headers: {
                'Access-Control-Expose-Headers': 'Content-Disposition',
                'Content-Disposition': 'attachment; filename="commissions.csv"',
              },
            };

            res.status(200).sendFile(path, options, error => {
              if (error) {
                throw error;
              }
            });
          });
        },
      );
      return {
        success: 'Commissions Exported!',
      };
    } catch (e) {
      this.logger.error(`Did not export commissions `, e.stack);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/actions/create-earn-return')
  async createReturn(@Body() inventoryDto: InventoryDto) {
    const { ids } = inventoryDto.data.attributes;

    await this.inventoryService.createEarnReturn(ids);

    return {
      success: 'Shipment created!',
    };
  }
}
