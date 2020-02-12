import { Inventory, Shipment, User } from '@app/database/entities';
import {
  InventoryStatus,
  ShipmentDirection,
  ShipmentStatus,
  ShipmentType,
} from '@app/database/enums';
import * as EasyPost from '@easypost/api';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as camelcaseKeysDeep from 'camelcase-keys-deep';
import { Op } from 'sequelize';

@Injectable()
export class EasyPostService {
  private logger = new Logger(EasyPostService.name);

  private readonly inventoryRepository: typeof Inventory = this.sequelize.getRepository(
    'Inventory',
  );

  private readonly shipmentRepository: typeof Shipment = this.sequelize.getRepository(
    'Shipment',
  );

  private readonly easyPostClient = new EasyPost(process.env.EASYPOST);

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  async updateShipment(easyPostId: string) {
    try {
      const easyPostShipment = camelcaseKeysDeep(
        await this.easyPostClient.Shipment.retrieve(easyPostId),
      );

      const shipment = await this.shipmentRepository.findOne({
        where: {
          easyPostId,
        },
      });

      shipment.status =
        ShipmentStatus[
          easyPostShipment.status
            .toUpperCase()
            .replace(/_/g, '') as keyof typeof ShipmentStatus
        ];

      shipment.parcel = JSON.stringify(easyPostShipment.parcel) as any;
      shipment.rates = JSON.stringify(easyPostShipment.rates) as any;
      shipment.rate = JSON.stringify(easyPostShipment.selectedRate) as any;
      shipment.tracker = JSON.stringify(easyPostShipment.tracker) as any;
      shipment.postage = JSON.stringify(easyPostShipment.postageLabel) as any;

      shipment.trackingCode = easyPostShipment.trackingCode;
      shipment.insurance = easyPostShipment.insurance;
      shipment.uspsZone = easyPostShipment.uspsZone;
      shipment.refundStatus = easyPostShipment.refundStatus;
      shipment.estDeliveryDate = easyPostShipment.tracker.estDeliveryDate;

      const carrierReceivedAt = easyPostShipment.tracker.trackingDetails.find(
        detail => detail.status === 'in_transit',
      )?.datetime;

      const carrierDeliveredAt = easyPostShipment.tracker.trackingDetails.find(
        detail => detail.status === 'delivered',
      )?.datetime;

      shipment.carrierReceivedAt = carrierReceivedAt
        ? new Date(carrierReceivedAt)
        : null;

      shipment.carrierDeliveredAt = carrierDeliveredAt
        ? new Date(carrierDeliveredAt)
        : null;

      await shipment.save();

      if (shipment.type === ShipmentType.ACCESS) {
        if (shipment.status === ShipmentStatus.DELIVERED) {
          await User.update(
            {
              billingHour: new Date().getHours(),
            },
            {
              where: {
                id: shipment.userId,
              },
            },
          );
        }
      }

      const shipmentInventory = await shipment.$get('inventory');

      let update: Partial<Inventory> = {};

      if (shipment.direction === ShipmentDirection.INBOUND) {
        if (!shipment.carrierDeliveredAt && shipment.carrierReceivedAt) {
          update = {
            status: InventoryStatus.ENROUTEWAREHOUSE,
          };
        } else if (shipment.carrierDeliveredAt) {
          update = {
            status: InventoryStatus.INSPECTING,
          };
        }
        if (update.status) {
          this.inventoryRepository.update(update, {
            where: {
              id: { [Op.in]: shipmentInventory.map(s => s.id) },
            },
            individualHooks: true,
          });
        }
      } else {
        if (!shipment.carrierDeliveredAt && shipment.carrierReceivedAt) {
          update = {
            status: InventoryStatus.ENROUTEMEMBER,
          };
        } else if (shipment.carrierDeliveredAt) {
          update = {
            status: InventoryStatus.WITHMEMBER,
          };
        }
        if (update.status) {
          this.inventoryRepository.update(update, {
            where: {
              id: { [Op.in]: shipmentInventory.map(s => s.id) },
            },
            individualHooks: true,
          });
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
  }
}
