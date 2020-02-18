import { Injectable, Inject } from '@nestjs/common';
import { Shipment } from '@app/database/entities';
import { Op } from 'sequelize';
@Injectable()
export class ShipmentService {
    private readonly shipmentRepository: typeof Shipment = this.sequelize.getRepository(
        'Shipment',
    );

    constructor(@Inject('SEQUELIZE') private readonly sequelize) { }

    findShipments(ids: string[]) {
        return this.shipmentRepository.findAll({
            where: { id: { [Op.in]: ids } },
        });
    }
}
