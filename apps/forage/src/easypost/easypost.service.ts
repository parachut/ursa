import { Injectable, Inject, Logger } from '@nestjs/common';
import { Inventory, Shipment } from '@app/database/entities';
import * as EasyPost from "@easypost/api";



const easyPost = new EasyPost(process.env.EASYPOST);

@Injectable()
export class EasyPostService {
    private logger = new Logger('EasyPostService')
    private readonly inventoryRepository: typeof Inventory = this.sequelize.getRepository(
        'Inventory',
    );
    private readonly shipmentRepository: typeof Shipment = this.sequelize.getRepository(
        'Shipment',
    );

    constructor(@Inject('SEQUELIZE') private readonly sequelize) { }

    async easyPost(easyPostBody): Promise<Shipment[]> {


        if (easyPostBody) {
            
            console.log(easyPostBody.id)

            const id = easyPostBody.id
            const shipment = await this.shipmentRepository.findAll({ where: { easyPostId: id } });
            return shipment;
            //    }
        }

        const shipmentUpdated = await this.shipmentRepository.findAll({ where: { easyPostId: "shp_dc08f030eb5d48db9def902af7eb25dd" } });
        return shipmentUpdated;
    }

}