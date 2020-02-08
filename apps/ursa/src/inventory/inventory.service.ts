import { Inventory } from '@app/database/entities';
import { InventoryStatus } from '@app/database/enums';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Op } from 'sequelize';

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
}
