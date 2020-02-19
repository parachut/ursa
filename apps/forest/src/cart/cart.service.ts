import { Cart, Inventory, Shipment } from '@app/database/entities';
import {
  InventoryStatus,
  ShipmentDirection,
  ShipmentType,
} from '@app/database/enums';
import { Inject, Injectable } from '@nestjs/common';
import { Op } from 'sequelize';

@Injectable()
export class CartService {
  private readonly cartRepository: typeof Cart = this.sequelize.getRepository(
    'Cart',
  );

  private readonly inventoryRepository: typeof Inventory = this.sequelize.getRepository(
    'Inventory',
  );

  private readonly shipmentRepository: typeof Shipment = this.sequelize.getRepository(
    'Shipment',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) { }

  async cancel(id: string) {
    const cart = await this.cartRepository.findByPk(id, {
      include: ['inventory'],
    });

    await this.inventoryRepository.update(
      {
        memberId: null,
        status: InventoryStatus.INWAREHOUSE,
      },
      {
        where: {
          id: {
            [Op.in]: cart.inventory
              .filter(i => i.status === InventoryStatus.SHIPMENTPREP)
              .map(i => i.id),
          },
          memberId: cart.userId,
        },
        individualHooks: true,
      },
    );

    cart.canceledAt = new Date();
    return cart.save();
  }

  async confirm(id: string) {
    const cart = await this.cartRepository.findByPk(id, {
      include: [
        {
          association: 'user',
          include: [
            {
              association: 'currentInventory',
              include: ['product'],
            },
            'integrations',
          ],
        },
        {
          association: 'items',
          include: ['product'],
        },
        'inventory',
      ],
    });

    cart.confirmedAt = new Date();
    await cart.save();

    const shipment = await this.shipmentRepository.create({
      direction: ShipmentDirection.OUTBOUND,
      expedited: cart.service !== 'Ground',
      type: ShipmentType.ACCESS,
      cartId: id,
    });

    return shipment.$set(
      'inventory',
      cart.inventory.map(item => item.id),
    );
  }

  async exportHistory(ids: Array<string>) {

    const carts = await this.cartRepository.findAll({
      where:
        ids && ids.length
          ? {
            id: { [Op.in]: ids },
            completedAt: { [Op.not]: null },

          }
          : {
            completedAt: { [Op.not]: null },
          },
      include: [
        {
          association: 'inventory',
          attributes: ['id'],
          include: ['product'],
        },
        {
          association: 'items',
          include: ['product'],
        },
        {
          association: 'shipments',
          order: [['carrierReceivedAt', 'DESC']],
        },
        {
          association: 'user',
        },
      ],
    });
    const report = carts.map((cart) => {
      let value = cart.items.reduce(
        (r: number, i: any) => r + i.quantity * i.product.points,
        0,
      );

      if (value <= 0) {
        value = cart.inventory.reduce(
          (r: number, i: any) => r + i.product.points,
          0,
        );
      }

      return {
        completedAt: new Date(cart.completedAt).toLocaleString(),
        shippedAt: cart.shipments.length
          ? new Date(cart.shipments[0].carrierReceivedAt).toLocaleString()
          : 'no shipment information',
        value,
        items: cart.inventory
          ? cart.inventory.length
          : cart.items.reduce((r: number, i: any) => r + i.quantity, 0),
        createdAt: new Date(cart.createdAt).toLocaleString(),
        member: cart.user ? cart.user.name : 'no name'
      };
    });
    return report
  }
}
