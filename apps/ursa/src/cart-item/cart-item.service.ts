import { Cart, CartItem, User } from '@app/database/entities';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CartService } from '../cart/cart.service';

@Injectable()
export class CartItemService {
  private readonly cartRepository: typeof Cart = this.sequelize.getRepository(
    'Cart',
  );

  private readonly cartItemRepository: typeof CartItem = this.sequelize.getRepository(
    'CartItem',
  );

  private readonly userRepository: typeof User = this.sequelize.getRepository(
    'User',
  );

  constructor(
    @Inject('SEQUELIZE') private readonly sequelize,
    private readonly cartService: CartService,
  ) {}

  async find(cartId: string): Promise<CartItem[]> {
    return CartItem.findAll({
      where: {
        cartId,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  async createCartItem(
    input: Partial<CartItem>,
    userId: string,
  ): Promise<CartItem> {
    const cart = await this.cartService.findOne(userId);

    if (!cart) {
      throw new NotFoundException(userId);
    }

    return this.cartItemRepository.create({
      ...input,
      userId,
      cartId: cart.id,
    });
  }

  async updateCartItem(id: string, quantity: number, userId: string) {
    const cartItem = await this.cartItemRepository.findOne({
      where: {
        id,
        '$cart.user_id$': userId,
        '$cart.completed_at$': null,
      },
      include: ['cart'],
    });

    if (!cartItem) {
      throw new NotFoundException(id);
    }

    cartItem.quantity = quantity;

    return cartItem.save();
  }

  async destroyCartItem(id: string, userId: string) {
    const cartItem = await this.cartItemRepository.findOne({
      where: {
        id,
        '$cart.user_id$': userId,
        '$cart.completed_at$': null,
      },
      include: ['cart'],
    });

    if (!cartItem) {
      throw new NotFoundException(id);
    }

    await CartItem.destroy({
      where: {
        id,
      },
    });

    return cartItem.save();
  }
}
