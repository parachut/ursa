import { Inventory, Income } from '@app/database/entities';
import { InventoryStatus, IncomeType } from '@app/database/enums';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { Op } from 'sequelize';

@Injectable()
export class InventoryService {
  private logger = new Logger(InventoryService.name);

  private readonly inventoryRepository: typeof Inventory = this.sequelize.getRepository(
    'Inventory',
  );

  private readonly incomeRepository: typeof Income = this.sequelize.getRepository(
    'Income',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  async updateShipmentInventory(ids: string[], status: InventoryStatus) {
    return this.inventoryRepository.update(
      {
        status,
      },
      {
        where: {
          id: { [Op.in]: ids },
        },
        individualHooks: true,
      },
    );
  }

  async payCommission(hour: number) {
    let inventory = await this.inventoryRepository.findAll({
      where: {
        '$member.billing_hour$': hour,
        status: InventoryStatus.WITHMEMBER,
      },
      include: ['member', 'incomes'],
    });

    const TWELVE_HOUR = 12 * 60 * 60 * 1000;

    inventory = inventory.filter(
      i =>
        !i.incomes.find(
          ii => new Date().getTime() - ii.createdAt.getTime() < TWELVE_HOUR,
        ),
    );

    const incomes: Partial<Income>[] = inventory.map(i => ({
      commission: i.commission,
      userId: i.userId,
      memberId: i.memberId,
      type: IncomeType.INVENTORY,
      membership: true,
      inventoryId: i.id,
    }));

    this.logger.log({ count: inventory.length, hour });

    return this.incomeRepository.bulkCreate(incomes);
  }
}
