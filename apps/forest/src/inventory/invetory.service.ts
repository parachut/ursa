import { Injectable, Inject, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Inventory } from '@app/database/entities';

@Injectable()
export class InventoryService {
    private logger = new Logger('InventoryService')
    private readonly inventoryRepository: typeof Inventory = this.sequelize.getRepository(
        'Inventory',
    );
    constructor(@Inject('SEQUELIZE') private readonly sequelize) { }
}