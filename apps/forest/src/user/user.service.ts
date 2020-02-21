import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cart, User, ShipKit, ShipKitInventory } from '@app/database/entities';
import { Op } from 'sequelize';
import numeral from 'numeral';
import { sortBy } from 'lodash';

@Injectable()
export class UserService {
  private logger = new Logger('UserService');
  private readonly cartRepository: typeof Cart = this.sequelize.getRepository(
    'Cart',
  );

  private readonly userRepository: typeof User = this.sequelize.getRepository(
    'User',
  );

  private readonly shipkitRepository: typeof ShipKit = this.sequelize.getRepository(
    'ShipKit',
  );
  private readonly shipkitinvetoryRepository: typeof ShipKitInventory = this.sequelize.getRepository(
    'ShipKitInventory',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  findUser(id: string) {
    return this.userRepository.findByPk(id);
  }

  async exportProximity() {
    try {
      const users = await this.userRepository.findAll({
        include: [
          {
            association: 'carts',
            include: [
              {
                association: 'items',
                include: ['product'],
              },
            ],
          },
          'addresses',
        ],
      });
      const report = users
        .filter(user => {
          const cart = user.carts.find(cart => !cart.completedAt);
          return cart && cart.items.length;
        })
        .map(user => {
          const cart = user.carts.find(cart => !cart.completedAt);

          const cartItemsSorted = sortBy(cart.items, function(item) {
            return item.updatedAt;
          });

          let proximity = user.addresses.length ? 1 : 0;
          proximity += user.planId ? 1 : 0;

          return {
            name: user.name,
            email: user.email,
            phone: user.phone,
            lastCartAdd: new Date(
              cartItemsSorted[0].updatedAt,
            ).toLocaleDateString('en-US'),
            cartValue: numeral(
              cart.items.reduce((r, i) => r + i.product.points, 0),
            ).format('$0,0.00'),
            cartItems: cart.items.map(i => i.product.name).join(', '),
            proximity,
          };
        });

      return report;
    } catch (e) {
      this.logger.error(
        `Could not find all user/ generate report (exportProximity) `,
        e.stack,
      );
    }
  }

  async createShipKit(airbox: boolean, ids: string[]) {
    try {
      await this.shipkitRepository.create({
        completedAt: new Date(),
        confirmedAt: new Date(),
        userId: ids[0],
        airbox: airbox,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (e) {
      this.logger.error(`Could not create shipKit`, e.stack);
    }
  }
}
