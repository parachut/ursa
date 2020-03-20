import { Address, Inventory, Shipment } from '@app/database/entities';
import { ShipmentDirection, ShipmentType } from '@app/database/enums';
import { EasyPostService } from '@app/easypost';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Op } from 'sequelize';

import { ShipmentCreateInput } from './dto/shipment-create.input';

@Injectable()
export class ShipmentService {
  private readonly logger = new Logger(ShipmentService.name);

  private readonly shipmentRepository: typeof Shipment = this.sequelize.getRepository(
    'Shipment',
  );

  private readonly inventoryRepository: typeof Inventory = this.sequelize.getRepository(
    'Inventory',
  );

  private readonly addressRepository: typeof Address = this.sequelize.getRepository(
    'Address',
  );

  constructor(
    @Inject('SEQUELIZE') private readonly sequelize,
    private readonly easyPostService: EasyPostService,
  ) {}

  async findOne(id: string, userId: string) {
    const shipment = await this.shipmentRepository.findOne({
      where: { id, userId },
    });

    if (!shipment) {
      throw new NotFoundException(id);
    }

    return shipment;
  }

  async find(userId: string) {
    return this.shipmentRepository.findAll({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  async create(input: ShipmentCreateInput, userId: string) {
    const address = await this.addressRepository.findOne({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']],
    });

    if (!address) {
      throw new NotFoundException(userId);
    }

    const shipment = await this.shipmentRepository.create({
      addressId: address.id,
      direction: input.direction,
      expedited: input.expedited || false,
      type: input.type,
      shipKitId: input.shipKitId,
      returnId: input.returnId,
      cartId: input.cartId,
      userId,
      width: input.width,
      height: input.height,
      length: input.length,
    });

    if (
      input.direction === ShipmentDirection.INBOUND &&
      input.type === ShipmentType.ACCESS
    ) {
      await this.inventoryRepository.update(
        {
          status: 'RETURNING',
        },
        {
          where: {
            id: { [Op.in]: input.inventoryIds },
          },
          individualHooks: true,
        },
      );
    }

    if (!shipment.pickup) {
      const labelInformation = await this.easyPostService.createLabel({
        easyPostId: address.easyPostId,
        inbound: input.direction === ShipmentDirection.INBOUND,
        expedited: input.expedited,
        airbox: input.airbox,
        width: shipment.width,
        length: shipment.length,
        height: shipment.height,
      });

      Object.assign(shipment, labelInformation);

      await shipment.save();
    }

    await shipment.$set('inventory', input.inventoryIds);

    /** This is due to sequelize
     *  not returning the json fields properly.
     *  Look for a fix later. */
    return this.shipmentRepository.findByPk(shipment.get('id'));
  }

  async lastByInventory(id: string, direction: ShipmentDirection) {
    return this.shipmentRepository.findOne({
      where: {
        direction,
      },
      include: [
        {
          required: true,
          model: this.inventoryRepository,
          where: { id },
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }
}
