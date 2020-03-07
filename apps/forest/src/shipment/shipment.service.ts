import { Shipment } from '@app/database/entities';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Op } from 'sequelize';
import { EasyPostService } from '@app/easypost';
import { ShipmentDirection } from '@app/database/enums';

@Injectable()
export class ShipmentService {
  private logger = new Logger('ShipmentService');
  private readonly shipmentRepository: typeof Shipment = this.sequelize.getRepository(
    'Shipment',
  );
  constructor(
    @Inject('SEQUELIZE') private readonly sequelize,
    private readonly easyPostService: EasyPostService,
  ) {}

  findShipments(ids: string[]) {
    try {
      return this.shipmentRepository.findAll({
        where: { id: { [Op.in]: ids } },
      });
    } catch (e) {
      this.logger.error(`Could not find shipments`, e);
      throw new Error(e.message);
    }
  }

  async generateLabel(shipment: Shipment) {
    const address = await shipment.$get('address');

    const labelInformation = await this.easyPostService.createLabel({
      easyPostId: address.easyPostId,
      inbound: shipment.direction === ShipmentDirection.INBOUND,
      expedited: false,
      airbox: false,
    });

    Object.assign(shipment, labelInformation);

    await shipment.save();

    return this.shipmentRepository.findByPk(shipment.id);
  }
}
