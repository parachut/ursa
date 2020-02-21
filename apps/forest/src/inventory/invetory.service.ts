import { Injectable, Inject, Logger } from '@nestjs/common';
import { Inventory, Shipment } from '@app/database/entities';
import { Op, Sequelize } from 'sequelize';
import { ShipmentType, ShipmentDirection } from '@app/database/enums';
import numeral from 'numeral';
import { CalculatorService } from '@app/calculator';
import { sortBy, findLast } from 'lodash';

@Injectable()
export class InventoryService {
  private logger = new Logger('InventoryService');
  private readonly inventoryRepository: typeof Inventory = this.sequelize.getRepository(
    'Inventory',
  );

  private readonly shipmentRepository: typeof Shipment = this.sequelize.getRepository(
    'Shipment',
  );
  constructor(
    private readonly calcService: CalculatorService,
    @Inject('SEQUELIZE') private readonly sequelize,
  ) {}

  async exportCommissions(startDate: Date, endDate: Date, ids: Array<string>) {
    try {
      const items = await this.inventoryRepository.findAll({
        where: ids && ids.length ? { id: { [Op.in]: ids } } : {},
        include: [
          'user',
          'product',
          {
            association: 'shipments',
            order: [['carrierReceivedAt', 'ASC']],
          },
        ],
      });

      const report = items.map(item => {
        let lastOutbound = 0;

        const monthShipments = sortBy(
          item.shipments
            .filter(shipment => shipment.type === ShipmentType.ACCESS)
            .filter(shipment => {
              return (
                (shipment.carrierDeliveredAt &&
                  shipment.carrierDeliveredAt.getTime() > startDate.getTime() &&
                  shipment.carrierDeliveredAt.getTime() < endDate.getTime() &&
                  shipment.direction === ShipmentDirection.OUTBOUND) ||
                (shipment.carrierReceivedAt &&
                  shipment.carrierReceivedAt.getTime() > startDate.getTime() &&
                  shipment.carrierReceivedAt.getTime() < endDate.getTime() &&
                  shipment.direction === ShipmentDirection.INBOUND)
              );
            }),
          [
            function(o) {
              return o.carrierReceivedAt.getTime();
            },
          ],
        );

        let secondsInCirculation = monthShipments.reduce(
          (r: number, i: any) => {
            if (lastOutbound > 0 && i.direction === 'INBOUND') {
              return r + (i.carrierReceivedAt.getTime() - lastOutbound);
            } else if (i.direction === 'OUTBOUND') {
              lastOutbound = i.carrierDeliveredAt.getTime();
              return r;
            } else if (
              r === 0 &&
              lastOutbound === 0 &&
              i.direction === 'INBOUND'
            ) {
              return r + (i.carrierReceivedAt.getTime() - startDate.getTime());
            }
          },
          0,
        );

        if (
          secondsInCirculation > 0 ||
          (secondsInCirculation === 0 && lastOutbound > 0)
        ) {
          const lastShipment = monthShipments[monthShipments.length - 1];
          if (
            lastShipment &&
            lastShipment.direction === ShipmentDirection.OUTBOUND
          ) {
            secondsInCirculation =
              secondsInCirculation + (endDate.getTime() - lastOutbound);
          }
        }

        if (secondsInCirculation === 0) {
          const prevousToShipment: Shipment = findLast(
            item.shipments.filter(
              shipment => shipment.type === ShipmentType.ACCESS,
            ),
            shipment =>
              shipment.carrierDeliveredAt &&
              shipment.carrierDeliveredAt.getTime() < startDate.getTime() &&
              shipment.direction === ShipmentDirection.OUTBOUND,
          );

          if (prevousToShipment) {
            const nextToShipment: Shipment = item.shipments
              .filter(shipment => shipment.type === ShipmentType.ACCESS)
              .find(
                shipment =>
                  shipment.userId === prevousToShipment.userId &&
                  shipment.direction === ShipmentDirection.INBOUND &&
                  shipment.carrierReceivedAt &&
                  shipment.carrierReceivedAt.getTime() >
                    prevousToShipment.carrierDeliveredAt.getTime(),
              );

            if (
              (nextToShipment &&
                nextToShipment.carrierReceivedAt.getTime() >
                  endDate.getTime()) ||
              !nextToShipment
            ) {
              secondsInCirculation = endDate.getTime() - startDate.getTime();
            }
          }
        }

        const daysInCirculation =
          secondsInCirculation > 0
            ? Math.ceil(secondsInCirculation / (1000 * 60 * 60 * 24))
            : 0;
        const dailyCommission = this.calcService.dailyCommission(
          item.product.points,
        );

        return {
          name: item.product.name,
          value: item.product.points,
          serial: item.serial,
          total: numeral(Number(daysInCirculation) * dailyCommission).format(
            '$0,0.00',
          ),
          contributorName: item.user ? item.user.name : 'no name',
          contributorEmail: item.user ? item.user.email : 'no email',
          contributorPhone: item.user ? item.user.phone : 'no phone',
          daysInCirculation,
        };
      });

      return report;
    } catch (e) {
      this.logger.error(`Did not find inventories/create report `, e.stack);
    }
  }

  async findInventoryStatusPoint() {
    try {
      const inventory = await this.inventoryRepository.findAll({
        group: ['status'],
        attributes: [
          ['status', 'key'],
          [Sequelize.fn('SUM', Sequelize.col('product.points')), 'value'],
        ],
        raw: true,
        include: [
          {
            association: 'product',
            attributes: [],
          },
        ],
      });
      return inventory;
    } catch (e) {
      this.logger.error(
        `Did not find inventories for the stats/chart `,
        e.stack,
      );
    }
  }

  async createEarnReturn(ids: string[]) {
    const inventory = await this.inventoryRepository.findAll({
      where: ids && ids.length ? { id: { [Op.in]: ids } } : {},
      include: [
        {
          association: 'user',
          include: ['addresses'],
        },
      ],
    });

    if (inventory.find(i => i.userId !== inventory[0].userId)) {
      throw new Error('inventory has to belong to the same user');
    }

    const address = inventory[0].user.addresses.length
      ? inventory[0].user.addresses.find(address => address.primary) ||
        inventory[0].user.addresses[0]
      : null;

    if (!address) {
      throw new Error("User doesn't have any addresses.");
    }

    const [shipment] = await Promise.all([
      this.shipmentRepository.create({
        addressId: address.id,
        direction: ShipmentDirection.OUTBOUND,
        type: ShipmentType.EARN,
        userId: inventory[0].userId,
      }),
      this.inventoryRepository.update(
        {
          status: 'RETURNING',
        },
        {
          where: {
            id: { [Op.in]: ids },
          },
          individualHooks: true,
        },
      ),
    ]);

    await shipment.$set('inventory', ids);

    return shipment;
  }
}
