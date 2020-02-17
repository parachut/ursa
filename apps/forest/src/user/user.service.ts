import { Injectable, Inject } from '@nestjs/common';
import { Cart, User } from '@app/database/entities';
import { Op } from 'sequelize';
@Injectable()
export class UserService {
  private readonly cartRepository: typeof Cart = this.sequelize.getRepository(
    'Cart',
  );

  private readonly userRepository: typeof User = this.sequelize.getRepository(
    'User',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  findUser(id: string) {
    return this.userRepository.findByPk(id);
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
