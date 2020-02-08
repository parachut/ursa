import { Inventory, Shipment } from '@app/database/entities';
import { ShipmentDirection } from '@app/database/enums';
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

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

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
    const [shipment] = await Promise.all([
      this.shipmentRepository.create({
        direction: input.direction,
        type: input.type,
        userId,
      }),
      this.inventoryRepository.update(
        {
          status: 'RETURNING',
        },
        {
          where: {
            id: { [Op.in]: input.inventoryIds },
          },
          individualHooks: true,
        },
      ),
    ]);

    await shipment.$set('inventory', input.inventoryIds);

    return shipment;
  }

  async lastByInventory(id: string, direction: ShipmentDirection) {
    return this.shipmentRepository.findOne({
      where: {
        direction,
      },
      include: [
        {
          required: true,
          model: Inventory,
          where: { id },
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }
}
