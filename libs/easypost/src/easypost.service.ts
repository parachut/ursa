import { Address, Shipment } from '@app/database/entities';
import EasyPost from '@easypost/api';
import { Injectable, Logger } from '@nestjs/common';
import camelcaseKeysDeep from 'camelcase-keys-deep';
import { groupBy, sortBy } from 'lodash';

@Injectable()
export class EasyPostService {
  private readonly logger = new Logger(EasyPostService.name);
  private readonly easyPostClient = new EasyPost(process.env.EASYPOST);

  async createAddress(
    address: Address,
  ): Promise<{
    residential: string;
    zip: string;
    easyPostId: string;
  }> {
    const easyPostAddress = new this.easyPostClient.Address({
      city: address.city,
      country: address.country,
      email: address.email,
      phone: address.phone,
      name: address.name,
      state: address.state,
      street1: address.street,
      street2: address.street2,
      zip: address.zip,
    });

    await easyPostAddress.save();

    return {
      residential: easyPostAddress.residential,
      zip: easyPostAddress.zip,
      easyPostId: easyPostAddress.id,
    };
  }

  async createLabel({
    easyPostId,
    inbound,
    expedited = false,
    width = 12,
    height = 12,
    length = 12,
    weight = 2,
    warehouseId = 'adr_19cef24ce0ec4669812440be6ce46ee5',
  }: {
    easyPostId: string;
    inbound: boolean;
    expedited?: boolean;
    width?: number;
    height?: number;
    length?: number;
    weight?: number;
    warehouseId?: string;
  }): Promise<Partial<Shipment>> {
    const returnable: Partial<Shipment> = {};

    const parcel = new this.easyPostClient.Parcel({
      height,
      length,
      weight,
      width,
    });

    const shipment: any = {
      buyer_address: warehouseId,
      from_address: inbound ? easyPostId : warehouseId,
      options: {
        delivery_confirmation: 'ADULT_SIGNATURE',
        label_size: '4X6',
        address_validation_level: 0,
      },
      parcel,
      to_address: inbound ? warehouseId : easyPostId,
    };

    const easyPostShipment = new this.easyPostClient.Shipment(shipment);

    try {
      await easyPostShipment.save();

      if (easyPostShipment.rates.length > 2) {
        const rates = groupBy(
          easyPostShipment.rates.filter(r => r.delivery_days),
          o => {
            return Number(o.delivery_days);
          },
        );

        const levels = Object.keys(rates).map(Number);
        const level = expedited ? rates[levels[0]] : rates[levels[1]];

        const uspsExpress = easyPostShipment.rates.find(
          rate => rate.service === 'Express',
        );

        if (uspsExpress) {
          rates[levels[0]].push(uspsExpress);
        }

        const rateSorted = sortBy(level, o => Number(o.rate));

        returnable.estDeliveryDate = new Date(rateSorted[0].delivery_date);
        await easyPostShipment.buy(rateSorted[0]);
      } else {
        throw new Error('No rates available');
      }

      await easyPostShipment.convertLabelFormat('ZPL');
    } catch (e) {
      this.logger.error(JSON.stringify(e));
      throw new Error('Unable to create shipment label.');
    }

    const camalBody = camelcaseKeysDeep(easyPostShipment);

    returnable.parcel = JSON.stringify(camalBody.parcel) as any;
    returnable.rates = JSON.stringify(camalBody.rates) as any;
    returnable.rate = JSON.stringify(camalBody.selectedRate) as any;
    returnable.tracker = JSON.stringify(camalBody.tracker) as any;
    returnable.postage = JSON.stringify(camalBody.postageLabel) as any;

    returnable.easyPostId = camalBody.id;
    returnable.trackingCode = camalBody.trackingCode;
    returnable.insurance = camalBody.insurance;
    returnable.uspsZone = camalBody.uspsZone;
    returnable.refundStatus = camalBody.refundStatus;

    return returnable;
  }
}
