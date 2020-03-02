import { Cart, Inventory, Shipment } from '@app/database/entities';
import {
  InventoryStatus,
  ShipmentDirection,
  ShipmentType,
} from '@app/database/enums';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Op } from 'sequelize';
import { EasyPostService } from '@app/easypost';

@Injectable()
export class CartService {
  private logger = new Logger('CartService');
  private readonly cartRepository: typeof Cart = this.sequelize.getRepository(
    'Cart',
  );

  private readonly inventoryRepository: typeof Inventory = this.sequelize.getRepository(
    'Inventory',
  );

  private readonly shipmentRepository: typeof Shipment = this.sequelize.getRepository(
    'Shipment',
  );

  constructor(
    @Inject('SEQUELIZE') private readonly sequelize,
    private readonly easyPostService: EasyPostService,
  ) {}

  async cancel(id: string) {
    try {
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
    } catch (e) {
      this.logger.error(
        `Could not findByPk/ update inventory (cancelCart) `,
        e.stack,
      );
    }
  }

  async confirm(id: string) {
    try {
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
          'address',
        ],
      });

      cart.confirmedAt = new Date();
      await cart.save();

      const shipment = await this.shipmentRepository.create({
        addressId: cart.addressId,
        direction: ShipmentDirection.OUTBOUND,
        expedited: cart.service !== 'Ground',
        type: ShipmentType.ACCESS,
        cartId: id,
      });

      if (!shipment.pickup) {
        const labelInformation = await this.easyPostService.createLabel({
          easyPostId: cart.address.easyPostId,
          inbound: false,
          expedited: cart.service !== 'Ground',
          airbox: false,
        });

        Object.assign(shipment, labelInformation);

        await shipment.save();
      }

      return shipment.$set(
        'inventory',
        cart.inventory.map(item => item.id),
      );
    } catch (e) {
      this.logger.error(
        `Could not findByPk/ create shipment (confirmCart) `,
        e.stack,
      );
    }
  }

  async exportHistory(ids: Array<string>) {
    try {
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
      const report = carts.map(cart => {
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
          member: cart.user ? cart.user.name : 'no name',
        };
      });
      return report;
    } catch (e) {
      this.logger.error(`Could not carts/generate report `, e.stack);
    }
  }
}
