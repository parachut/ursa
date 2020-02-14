import { Shipment } from '@app/database/entities';
import {
  InventoryStatus,
  ShipmentDirection,
  ShipmentStatus,
  ShipmentType,
} from '@app/database/enums';
import * as EasyPost from '@easypost/api';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as camelcaseKeysDeep from 'camelcase-keys-deep';

import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class ShipmentService {
  private logger = new Logger(ShipmentService.name);

  private readonly shipmentRepository: typeof Shipment = this.sequelize.getRepository(
    'Shipment',
  );

  private readonly easyPostClient = new EasyPost(process.env.EASYPOST);

  constructor(
    @Inject('SEQUELIZE') private readonly sequelize,
    private readonly inventoryService: InventoryService,
  ) {}

  async trackerUpdated(easyPostId: string) {
    try {
      const easyPostShipment = camelcaseKeysDeep(
        await this.easyPostClient.Shipment.retrieve(easyPostId),
      );

      const shipment = await this.shipmentRepository.findOne({
        where: {
          easyPostId,
        },
        include: ['user'],
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
        detail =>
          detail.status === 'delivered' ||
          detail.status === 'available_for_pickup',
      )?.datetime;

      shipment.carrierReceivedAt = carrierReceivedAt
        ? new Date(carrierReceivedAt)
        : null;

      shipment.carrierDeliveredAt = carrierDeliveredAt
        ? new Date(carrierDeliveredAt)
        : null;

      await shipment.save();

      if (shipment.type === ShipmentType.ACCESS) {
        if (
          shipment.status === ShipmentStatus.DELIVERED ||
          shipment.status === ShipmentStatus.AVAILABLEFORPICKUP
        ) {
          shipment.user.billingHour = new Date().getHours();
          await shipment.user.save();
        }
      }

      const shipmentInventory = await shipment.$get('inventory');

      let status: InventoryStatus;

      if (shipment.direction === ShipmentDirection.INBOUND) {
        if (!shipment.carrierDeliveredAt && shipment.carrierReceivedAt) {
          status = InventoryStatus.ENROUTEWAREHOUSE;
        } else if (shipment.carrierDeliveredAt) {
          status = InventoryStatus.INSPECTING;
        }
      } else {
        if (!shipment.carrierDeliveredAt && shipment.carrierReceivedAt) {
          status = InventoryStatus.ENROUTEMEMBER;
        } else if (shipment.carrierDeliveredAt) {
          status = InventoryStatus.WITHMEMBER;
        }
        if (status) {
          await this.inventoryService.updateShipmentInventory(
            shipmentInventory.map(i => i.id),
            status,
          );
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
  }
}
