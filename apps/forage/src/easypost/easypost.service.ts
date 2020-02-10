import { Injectable, Inject, Logger } from '@nestjs/common';
import { User, Shipment, Inventory } from '@app/database/entities';
import * as EasyPost from "@easypost/api";
import { empty } from 'rxjs';
import { ShipmentStatus } from "../../../../libs/database/src/enums/shipment-status.enum";
import { ShipmentType } from "../../../../libs/database/src/enums/shipment-type.enum";
import { ShipmentDirection } from "../../../../libs/database/src/enums/shipment-direction.enum";
import { InventoryStatus } from "../../../../libs/database/src/enums/inventory-status.enum";

import { Op } from 'sequelize';
const easyPost = new EasyPost(process.env.EASYPOST);

@Injectable()
export class EasyPostService {
    private logger = new Logger('EasyPostService')
    private readonly inventoryRepository: typeof Inventory = this.sequelize.getRepository(
        'Inventory',
    );
    private readonly userRepository: typeof User = this.sequelize.getRepository(
        'User',
    );
    private readonly shipmentRepository: typeof Shipment = this.sequelize.getRepository(
        'Shipment',
    );

    constructor(@Inject('SEQUELIZE') private readonly sequelize) { }

    async easyPost(easyPostBody): Promise<Shipment[]> {


        if (easyPostBody != undefined) {

            console.log(easyPostBody.id)

            const id = easyPostBody.id
            try {
                // const shipment = await this.shipmentRepository.findAll({ where: { easyPostId: id } });
                const shipment = await this.shipmentRepository.findOne({
                    where: { easyPostId: easyPostBody.shipment_id },
                    include: ['user'],
                });
                const carrierRecieved = easyPostBody.tracker.tracking_details.find(
                    (x: any) => x.status === 'in_transit',
                );
                const carrierDelivered = easyPostBody.tracker.tracking_details.find(
                    (x: any) => x.status === 'delivered',
                );

                if (carrierRecieved) {
                    shipment.carrierReceivedAt = new Date(carrierRecieved.datetime);
                }

                if (carrierDelivered) {
                    shipment.carrierDeliveredAt = new Date(carrierDelivered.datetime);
                }

                shipment.status = ShipmentStatus[
                    easyPostBody.status
                        .toUpperCase()
                        .replace(/_/g, "") as keyof typeof ShipmentStatus
                ];


                shipment.signedBy = easyPostBody.tracker.signed_by;
                shipment.estDeliveryDate = new Date(easyPostBody.tracker.est_delivery_date);
                shipment.weight = easyPostBody.tracker.weight;

                await shipment.save();

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

                // if (shipment.type === ShipmentType.ACCESS) {
                //     let update = {
                //         status: null,
                //     };

                //     const shipmentInventory = (await shipment.$get<Inventory>(
                //         'inventory',
                //     )) as Inventory[];


                //     if (shipment.direction === ShipmentDirection.INBOUND) {
                //         if (!shipment.carrierDeliveredAt && shipment.carrierReceivedAt) {
                //             update = {
                //                 status: InventoryStatus.ENROUTEWAREHOUSE,
                //             };
                //         } else if (shipment.carrierDeliveredAt) {
                //             update = {
                //                 status: InventoryStatus.INSPECTING,
                //             };
                //         }
                //         if (update.status) {
                //             Inventory.update(update, {
                //                 where: {
                //                     id: { [Op.in]: shipmentInventory.map((s) => s.id) },
                //                 },
                //                 individualHooks: true,
                //             });
                //         }
                //     } else {
                //         if (!shipment.carrierDeliveredAt && shipment.carrierReceivedAt) {
                //             update = {
                //                 status: InventoryStatus.ENROUTEMEMBER,
                //             };
                //         } else if (shipment.carrierDeliveredAt) {
                //             update = {
                //                 status: InventoryStatus.WITHMEMBER,
                //             };
                //         }
                //         if (update.status) {
                //             Inventory.update(update, {
                //                 where: {
                //                     id: { [Op.in]: shipmentInventory.map((s) => s.id) },
                //                 },
                //                 individualHooks: true,
                //             });
                //         }
                //     }
                // }

                this.logger.log(`Shipment Updated`)
                return [];

            } catch (e) {
                this.logger.error(`Failed Inserting To DB `, e.stack)
            }






            //    }
        }

        // const shipmentUpdated = await this.shipmentRepository.findAll({ where: { easyPostId: "shp_dc08f030eb5d48db9def902af7eb25dd" } });
        // return shipmentUpdated;
    }

}