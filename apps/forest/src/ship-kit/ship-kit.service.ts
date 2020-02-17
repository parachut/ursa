import { Injectable, Inject, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ShipKit, ShipKitInventory } from '@app/database/entities';

@Injectable()
export class ShipKitService {
    private logger = new Logger('InventoryService')
    private readonly shipkitRepository: typeof ShipKit = this.sequelize.getRepository(
        'ShipKit',
    );
    private readonly shipkitinvetoryRepository: typeof ShipKitInventory = this.sequelize.getRepository(
        'ShipKitInventory',
    );
    constructor(@Inject('SEQUELIZE') private readonly sequelize) { }
}