import { Cart, Shipment, User } from '@app/database/entities';
import { Injectable, Inject } from '@nestjs/common';
import { Op } from 'sequelize';

@Injectable()
export class AppService {
  private readonly userRepository: typeof User = this.sequelize.getRepository(
    'User',
  );

  private readonly cartRepository: typeof Cart = this.sequelize.getRepository(
    'Cart',
  );

  private readonly shipmentRepository: typeof Shipment = this.sequelize.getRepository(
    'Shipment',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  findUser(id: string) {
    return this.userRepository.findByPk(id);
  }

  findShipments(ids: string[]) {
    return this.shipmentRepository.findAll({
      where: { id: { [Op.in]: ids } },
    });
  }

  findCarts(ids: string[]) {
    return this.cartRepository.findAll({
      where: { id: { [Op.in]: ids } },
      include: [
        {
          association: 'user',
          include: [
            {
              association: 'currentInventory',
              include: ['product'],
            },
            'integrations',
          ],
        },
        {
          association: 'items',
          include: ['product'],
        },
        'inventory',
      ],
    });
  }
}
