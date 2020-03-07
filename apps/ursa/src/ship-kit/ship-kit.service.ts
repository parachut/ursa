import { Address, Inventory, ShipKit, User } from '@app/database/entities';
import {
  InventoryStatus,
  ShipmentDirection,
  ShipmentType,
} from '@app/database/enums';
import { PackerService } from '@app/packer';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { unit } from 'mathjs';
import { Op } from 'sequelize';
import orderBy from 'lodash/orderBy';

import { EmailService } from '../email.service';
import { ShipmentService } from '../shipment/shipment.service';
import { SlackService } from '../slack.service';

@Injectable()
export class ShipKitService {
  private readonly logger = new Logger(ShipKitService.name);

  private readonly addressRepository: typeof Address = this.sequelize.getRepository(
    'Address',
  );

  private readonly inventoryRepository: typeof Inventory = this.sequelize.getRepository(
    'Inventory',
  );

  private readonly shipKitRepository: typeof ShipKit = this.sequelize.getRepository(
    'ShipKit',
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
    const shipKit = await this.shipKitRepository.findOne({
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

    if (!shipKit) {
      const user = await this.userRepository.findByPk(userId, {
        include: ['addresses'],
      });

      const address = user.addresses.length
        ? user.addresses.find(address => address.primary) || user.addresses[0]
        : null;

      return this.shipKitRepository.create({
        addressId: address ? address.id : null,
        userId,
      });
    }

    if (!shipKit.address) {
      const user = await this.userRepository.findByPk(userId, {
        include: ['addresses'],
      });

      if (user.addresses.length) {
        const address = user.addresses.length
          ? user.addresses.find(address => address.primary) || user.addresses[0]
          : null;

        shipKit.addressId = address.id;
      }

      return shipKit.save();
    }

    return shipKit;
  }

  async find(userId: string) {
    return this.shipKitRepository.findAll({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  async update(input: Partial<ShipKit>, userId: string) {
    const shipKit = await this.shipKitRepository.findOne({
      where: { userId, completedAt: null },
    });

    if (!shipKit) {
      throw new NotFoundException(userId);
    }

    Object.assign(shipKit, input);

    return shipKit.save();
  }

  async complete(userId: string) {
    let address;

    const shipKit = await this.shipKitRepository.findOne({
      where: { userId, completedAt: null },
      include: ['user', 'address'],
    });

    const user = await this.userRepository.findByPk(userId, {
      include: [
        {
          association: 'visits',
          include: ['affiliate'],
        },
      ],
    });

    const affiliate =
      user.visits && user.visits.length
        ? orderBy(user.visits, 'createdAt', 'desc')[0].affiliate
        : null;

    if (!shipKit) {
      throw new NotFoundException(userId);
    }

    if (!shipKit.addressId) {
      address = await this.addressRepository.findOne({
        where: {
          userId,
        },
        order: [['createdAt', 'DESC']],
      });

      if (!address) {
        throw new Error('Unable to find address for shipkit');
      }

      shipKit.addressId = address.id;
    }

    const inventory = await this.inventoryRepository.findAll({
      where: {
        userId: userId,
        status: InventoryStatus.NEW,
      },
      include: ['product'],
    });

    const bins = await this.packerService.pack(inventory);

    for (const bin of bins) {
      const outbound = await this.shipmentService.create(
        {
          direction: ShipmentDirection.INBOUND,
          type: ShipmentType.EARN,
          expedited: false,
          inventoryIds: bin.items.map(i => i.name),
          width: bin.width,
          height: bin.height,
          length: bin.depth,
        },
        userId,
      );

      if (shipKit.airbox) {
        await this.shipmentService.create(
          {
            direction: ShipmentDirection.OUTBOUND,
            type: ShipmentType.EARN,
            expedited: false,
            inventoryIds: bin.items.map(i => i.name),
            airbox: true,
            shipKitId: shipKit.id,
            width: bin.width,
            height: bin.height,
            length: bin.depth,
          },
          userId,
        );

        await this.emailService.send({
          to: shipKit.user.email,
          from: 'support@parachut.co',
          id: 13493488,
          data: {
            name: shipKit.user.parsedName.first,
            formattedAddress: address
              ? address.formattedAddress
              : shipKit.address.formattedAddress,
            trackerUrl: outbound.tracker.publicUrl,
            chutItems: bin.items.map(i => ({
              name: inventory.find(ii => ii.id === i.name).product.name,
            })),
          },
        });
      } else {
        await this.emailService.send({
          to: shipKit.user.email,
          from: 'support@parachut.co',
          id: 13394094,
          data: {
            name: shipKit.user.parsedName.first,
            labelUrl: outbound.postage.labelUrl,
            trackerUrl: outbound.tracker.publicUrl,
            chutItems: bin.items.map(i => ({
              name: inventory.find(ii => ii.id === i.name).product.name,
            })),
          },
        });
      }
    }

    await this.inventoryRepository.update(
      {
        status: InventoryStatus.ACCEPTED,
      },
      {
        where: {
          id: { [Op.in]: inventory.map(i => i.id) },
        },
        individualHooks: true,
      },
    );

    await this.slackService.shipKitMessage({
      shipKit,
      affiliate,
      user,
      shipments: bins.length,
      value: inventory.reduce((r, i) => r + i.product.points, 0),
    });

    await shipKit.$set(
      'inventory',
      inventory.map(i => i.id),
    );

    shipKit.completedAt = new Date();

    return shipKit.save();
  }
}
