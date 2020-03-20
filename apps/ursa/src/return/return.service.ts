import { Address, Inventory, Return, User } from '@app/database/entities';
import {
  InventoryStatus,
  ShipmentDirection,
  ShipmentType,
} from '@app/database/enums';
import { PackerService } from '@app/packer';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Op } from 'sequelize';

import { EmailService } from '@app/email';
import { ShipmentService } from '../shipment/shipment.service';
import { SlackService } from '@app/slack';

@Injectable()
export class ReturnService {
  private readonly logger = new Logger(ReturnService.name);

  private readonly addressRepository: typeof Address = this.sequelize.getRepository(
    'Address',
  );

  private readonly inventoryRepository: typeof Inventory = this.sequelize.getRepository(
    'Inventory',
  );

  private readonly returnRepository: typeof Return = this.sequelize.getRepository(
    'Return',
  );

  private readonly userRepository: typeof User = this.sequelize.getRepository(
    'User',
  );

  constructor(
    @Inject('SEQUELIZE') private readonly sequelize,
    private readonly shipmentService: ShipmentService,
    private readonly emailService: EmailService,
    private readonly packerService: PackerService,
    private readonly slackService: SlackService,
  ) {}

  async findOne(userId: string) {
    const _return = await this.returnRepository.findOne({
      where: {
        userId,
        completedAt: null,
      },
      include: [
        {
          association: 'inventory',
          include: ['product'],
        },
      ],
    });

    if (!_return) {
      const user = await this.userRepository.findByPk(userId, {
        include: ['addresses'],
      });

      const address = user.addresses.length
        ? user.addresses.find(address => address.primary) || user.addresses[0]
        : null;

      return this.returnRepository.create({
        addressId: address ? address.id : null,
        userId,
      });
    }

    if (!_return.address) {
      const user = await this.userRepository.findByPk(userId, {
        include: ['addresses'],
      });

      if (user.addresses.length) {
        const address = user.addresses.length
          ? user.addresses.find(address => address.primary) || user.addresses[0]
          : null;

        _return.addressId = address.id;
      }

      return _return.save();
    }

    return _return;
  }

  async find(userId: string) {
    return this.returnRepository.findAll({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  async complete(inventoryIds: string[], reason: string, userId: string) {
    let address;

    const _return = await this.returnRepository.findOne({
      where: { userId, completedAt: null },
      include: ['user', 'address'],
    });

    if (!_return) {
      throw new NotFoundException(userId);
    }

    if (!_return.addressId) {
      address = await this.addressRepository.findOne({
        where: {
          userId,
        },
        order: [['createdAt', 'DESC']],
      });

      if (!address) {
        throw new Error('Unable to find address for shipkit');
      }

      _return.addressId = address.id;
    }

    const inventory = await this.inventoryRepository.findAll({
      where: {
        id: { [Op.in]: inventoryIds },
      },
      include: ['product'],
    });

    const bins = await this.packerService.pack(inventory);

    for (const bin of bins) {
      await this.shipmentService.create(
        {
          direction: ShipmentDirection.OUTBOUND,
          type: ShipmentType.EARN,
          expedited: false,
          inventoryIds: bin.items.map(i => i.name),
          returnId: _return.id,
          width: bin.width,
          height: bin.height,
          length: bin.depth,
        },
        userId,
      );
    }

    await this.inventoryRepository.update(
      {
        status: InventoryStatus.RETURNING,
      },
      {
        where: {
          id: { [Op.in]: inventory.map(i => i.id) },
        },
        individualHooks: true,
      },
    );

    await this.slackService.returnMessage({
      _return,
      shipments: bins.length,
      user: _return.user,
      value: inventory.reduce((r, i) => r + i.product.points, 0),
    });

    await _return.$set(
      'inventory',
      inventory.map(i => i.id),
    );

    _return.completedAt = new Date();

    return _return.save();
  }
}
