import { Inventory } from '@app/database/entities';
import {
  InventoryStatus,
  ShipmentDirection,
  ShipmentType,
} from '@app/database/enums';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { differenceInCalendarDays } from 'date-fns';
import { last, sortBy } from 'lodash';
import * as numeral from 'numeral';
import { Op } from 'sequelize';

import { InventoryHistory } from './dto/inventory-history.type';
import { InventoryWhereInput } from './dto/inventory-where.input';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  private readonly inventoryRepository: typeof Inventory = this.sequelize.getRepository(
    'Inventory',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  async findOne(id: string, userId: string) {
    const item = await this.inventoryRepository.findOne({
      where: { id, userId },
    });

    if (!item) {
      throw new NotFoundException(id);
    }

    return item;
  }

  async find(where: InventoryWhereInput, userId: string) {
    const _where: any = {
      userId,
    };

    if (where && where.status) {
      _where.status = { [Op.in]: where.status };
    }

    return this.inventoryRepository.findAll({
      where: _where,
      order: [['createdAt', 'DESC']],
    });
  }

  async create(input: Partial<Inventory>, userId: string) {
    return this.inventoryRepository.create({
      ...input,
      userId,
    });
  }

  async update(input: Partial<Inventory>, id: string, userId: string) {
    const inventory = await this.inventoryRepository.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!inventory) {
      throw new NotFoundException(id);
    }

    Object.assign(inventory, input);

    return inventory.save();
  }

  async markForReturn(id: string, userId: string) {
    const inventory = await this.inventoryRepository.findOne({
      where: {
        id,
        userId,
      },
    });

    if (inventory.status === InventoryStatus.INWAREHOUSE) {
      inventory.status = InventoryStatus.RETURNING;
      inventory.markedForReturn = true;
    } else if (inventory.status === InventoryStatus.RETURNING) {
      inventory.status = InventoryStatus.INWAREHOUSE;
      inventory.markedForReturn = false;
    }

    return inventory.save();
  }

  async destroy(id: string, userId: string) {
    const inventory = await Inventory.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!inventory) {
      throw new NotFoundException(id);
    }

    await inventory.destroy();

    return inventory;
  }

  async history(id: string): Promise<InventoryHistory[]> {
    const item = await this.inventoryRepository.findByPk(id, {
      include: ['product'],
    });

    const groups: InventoryHistory[] = [];

    let shipments = await item.$get('shipments', {
      order: [['carrierReceivedAt', 'ASC']],
    });

    shipments = shipments
      .filter(ship => ship.type === ShipmentType.ACCESS)
      .filter(
        ship =>
          (ship.direction === ShipmentDirection.OUTBOUND &&
            ship.carrierDeliveredAt) ||
          (ship.direction === ShipmentDirection.INBOUND &&
            ship.carrierReceivedAt),
      );

    shipments = sortBy(shipments, ship =>
      ship.carrierReceivedAt
        ? ship.carrierReceivedAt.getTime()
        : ship.carrierDeliveredAt.getTime(),
    );

    shipments.forEach((shipment, i) => {
      if (
        shipment.direction === ShipmentDirection.OUTBOUND &&
        shipment.carrierDeliveredAt
      ) {
        const access: InventoryHistory = {
          out: shipment.carrierDeliveredAt,
          in: null,
          amount: 0,
          days: 0,
          serial: item.serial,
          name: item.product.name,
        };

        groups.push(access);
      } else {
        last(groups).in = shipment.carrierReceivedAt;
      }

      const final = last(groups);

      if (final.in || i === item.shipments.length - 1 || final.in === null) {
        final.days = differenceInCalendarDays(
          final.in || new Date(),
          final.out,
        );
        final.amount = numeral(item.commission * final.days).format('$0,00.00');
      }
    });

    return groups;
  }
}
