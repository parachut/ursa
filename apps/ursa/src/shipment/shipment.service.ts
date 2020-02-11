import { Inventory, Shipment, User } from '@app/database/entities';
import { ShipmentDirection, ShipmentType } from '@app/database/enums';
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

  private readonly userRepository: typeof User = this.sequelize.getRepository(
    'User',
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
    const user = await this.userRepository.findByPk(userId, {
      include: ['addresses'],
    });

    const address = user.addresses.length
      ? user.addresses.find(address => address.primary) || user.addresses[0]
      : null;

    if (!address) {
      throw new NotFoundException(userId);
    }

    const [shipment] = await Promise.all([
      this.shipmentRepository.create({
        addressId: address.id,
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
          model: this.inventoryRepository,
          where: { id },
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }
}
