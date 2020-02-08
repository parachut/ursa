import { Cart, User } from '@app/database/entities';
import { InventoryStatus } from '@app/database/enums';
import { Injectable, Inject } from '@nestjs/common';
import { Op } from 'sequelize';

@Injectable()
export class CartService {
  private readonly cartRepository: typeof Cart = this.sequelize.getRepository(
    'Cart',
  );

  private readonly userRepository: typeof User = this.sequelize.getRepository(
    'User',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  async findOne(userId: string) {
    const cart = await this.cartRepository.findOne({
      where: { userId, completedAt: null },
      include: [
        {
          association: 'items',
          include: ['product'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    if (!cart) {
      const user = await this.userRepository.findByPk(userId, {
        attributes: ['planId', 'protectionPlan'],
        include: ['addresses', 'integrations'],
      });

      const address = user.addresses.length
        ? user.addresses.find(address => address.primary) || user.addresses[0]
        : null;

      return this.cartRepository.create({
        planId: !!user.planId ? user.planId : 'level-1',
        addressId: address ? address.id : null,
        protectionPlan: user.protectionPlan,
        userId,
      });
    }

    if (cart.items.length) {
      for (const item of cart.items) {
        if (item.product.stock < item.quantity && item.product.stock !== 0) {
          item.quantity = item.product.stock;
          await item.save();
        }

        if (item.product.stock === 0) {
          await item.destroy();
        }
      }
    }

    return cart;
  }

  async find(userId: string) {
    return Cart.findAll({
      where: {
        userId,
        canceledAt: null,
        completedAt: { [Op.ne]: null },
      },
      order: [['createdAt', 'DESC']],
    });
  }

  async cancelCart(id: string, userId: string) {
    const cart = await this.cartRepository.findOne({
      where: { userId, id },
      include: ['inventory'],
    });

    if (cart.inventory && cart.inventory.length) {
      cart.inventory.forEach(item => {
        item.status = InventoryStatus.INWAREHOUSE;
      });
      await Promise.all(cart.inventory.map(item => item.save()));
    }

    cart.canceledAt = new Date();

    return cart.save();
  }

  async updateCart(input: Partial<Cart>, userId: string) {
    const cart = await Cart.findOne({
      where: { userId, completedAt: null },
      order: [['createdAt', 'DESC']],
    });

    Object.assign(cart, input);

    return cart.save();
  }
}
