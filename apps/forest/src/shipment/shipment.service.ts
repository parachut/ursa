import { Injectable, Inject, Logger } from '@nestjs/common';
import { Shipment } from '@app/database/entities';
import { Op } from 'sequelize';
@Injectable()
export class ShipmentService {
    private logger = new Logger('ShipmentService')
    private readonly shipmentRepository: typeof Shipment = this.sequelize.getRepository(
        'Shipment',
    );
    constructor(@Inject('SEQUELIZE') private readonly sequelize) { }

    findShipments(ids: string[]) {
        try {
            return this.shipmentRepository.findAll({
                where: { id: { [Op.in]: ids } },
            });
        } catch (e) {
            this.logger.error(`Could not all shipments `, e.stack)
        }
    }
}
