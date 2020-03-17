import { Cart, Inventory, User } from '@app/database/entities';
import { InventoryStatus, UserStatus } from '@app/database/enums';
import { RecurlyService } from '@app/recurly';
import { Inject, Injectable } from '@nestjs/common';
import orderBy from 'lodash/orderBy';
import numeral from 'numeral';
import { Op } from 'sequelize';

import { EmailService } from '@app/email';
import { SlackService } from '@app/slack';

const plans = {
  '1500': 149,
  '3500': 349,
  '750': 99,
  '7500': 499,
  'level-1': 249,
  'level-2': 399,
  'level-3': 499,
};

const planName = {
  'level-1': 'Level 1',
  'level-2': 'Level 2',
  'level-3': 'Level 3',
};

@Injectable()
export class CartService {
  private readonly cartRepository: typeof Cart = this.sequelize.getRepository(
    'Cart',
  );

  private readonly inventoryRepository: typeof Inventory = this.sequelize.getRepository(
    'Inventory',
  );

  private readonly userRepository: typeof User = this.sequelize.getRepository(
    'User',
  );

  constructor(
    @Inject('SEQUELIZE') private readonly sequelize,
    private readonly emailService: EmailService,
    private readonly recurlyService: RecurlyService,
    private readonly slackService: SlackService,
  ) {}

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
    return this.cartRepository.findAll({
      where: {
        userId,
        canceledAt: null,
        completedAt: { [Op.ne]: null },
      },
      order: [['createdAt', 'DESC']],
    });
  }

  async cancel(id: string, userId: string) {
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

  async update(input: Partial<Cart>, userId: string) {
    const cart = await this.cartRepository.findOne({
      where: { userId, completedAt: null },
      order: [['createdAt', 'DESC']],
    });

    Object.assign(cart, input);

    return cart.save();
  }

  async lastByInventory(id: string) {
    return this.cartRepository.findOne({
      where: {
        completedAt: { [Op.ne]: null },
      },
      include: [
        {
          required: true,
          model: this.inventoryRepository,
          where: { id },
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async complete(userId: string): Promise<Cart> {
    const user = await this.userRepository.findByPk(userId, {
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
        'integrations',
        {
          association: 'currentInventory',
          include: ['product'],
        },
        'subscription',
        {
          association: 'visits',
          include: ['affiliate'],
        },
      ],
      order: [['carts', 'createdAt', 'DESC']],
    });

    const affiliate =
      user.visits && user.visits.length
        ? orderBy(user.visits, 'createdAt', 'desc')[0].affiliate
        : null;

    const [cart] = user.carts;

    if (cart.completedAt) {
      throw new Error('Cart already complete');
    }

    if (!cart.completedAt && user.status === UserStatus.BLACKLISTED) {
      cart.completedAt = new Date();
      cart.canceledAt = new Date();
      return cart.save();
    }

    const availableInventory = await this.inventoryRepository.findAll({
      where: {
        productId: { [Op.in]: cart.items.map(item => item.productId) },
        status: InventoryStatus.INWAREHOUSE,
      },
    });

    const inventory: Inventory[] = [];
    cart.items.forEach(item => {
      if (item.points > 2500 && cart.planId !== 'level-3') {
        throw new Error(`${item.product.name} requires a level-3 membership.`);
      }
      if (item.points > 1000 && cart.planId === 'level-1') {
        throw new Error(
          `${item.product.name} requires at least a level-2 membership.`,
        );
      }

      const itemInventory = availableInventory.filter(
        i => i.productId === item.productId,
      );

      if (itemInventory.length < item.quantity) {
        throw new Error(`${item.product.name} is out of stock.`);
      }

      for (let i = 0; i < item.quantity; i++) {
        inventory.push(itemInventory[i]);
      }
    });

    const itemsCount = cart.items.reduce((r, ii) => r + ii.quantity, 0);

    const inUse = user.currentInventory.length;

    const overageItems = itemsCount + inUse > 3 ? itemsCount + inUse - 3 : 0;

    if (overageItems > user.additionalItems) {
      user.additionalItems = overageItems;
    }

    const recurlyId = this.recurlyService.findRecurlyIntegration(user);

    try {
      if (!user.subscription) {
        await this.recurlyService.createSubscription(
          cart.planId,
          cart.protectionPlan,
          user.additionalItems,
          cart.couponCode,
          recurlyId,
          cart.service !== 'Ground',
        );
      } else {
        if (cart.service !== 'Ground') {
          await this.recurlyService.expeditedCharge(recurlyId);
        }

        if (!user.legacyPlan) {
          await this.recurlyService.upgradePlan(
            cart.planId,
            cart.protectionPlan,
            user.additionalItems,
            user.subscription.id,
          );
        }
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'production') {
        await this.slackService.cartMessage({
          cart,
          name: user.name,
          affiliate,
          error: e.message,
        });
      }

      throw new Error(e.message);
    }

    await this.inventoryRepository.update(
      {
        status: 'SHIPMENTPREP',
        memberId: user.id,
      },
      {
        where: {
          id: {
            [Op.in]: inventory.map(i => i.id),
          },
        },
        individualHooks: true,
      },
    );

    if (process.env.NODE_ENV === 'production') {
      await this.slackService.cartMessage({
        cart,
        name: user.name,
        affiliate,
      });
    }

    await this.emailService.send({
      to: user.email,
      from: 'support@parachut.co',
      id: !user.subscription ? 12931487 : 12932745,
      data: {
        purchase_date: new Date().toDateString(),
        name: user.parsedName.first,
        cartItems: cart.items.map(item => ({
          image: item.product.images.length
            ? `https://parachut.imgix.net/${item.product.images[0]}`
            : '',
          name: item.product.name,
        })),
        extraSpots: {
          additionalItems: user.additionalItems,
          additionalCost: user.additionalItems * 99,
        },
        planId: planName[cart.planId],
        spotsUsed: user.additionalItems + 3,
        monthly: numeral(plans[cart.planId]).format('$0,0.00'),
        protectionPlan: cart.protectionPlan,
      },
    });

    user.planId = cart.planId;
    user.billingDay = user.billingDay || new Date().getDate();
    user.protectionPlan = cart.protectionPlan;
    user.points = cart.items.reduce((r, i) => r + i.points, 0);

    await user.save();

    cart.completedAt = new Date();
    await cart.$set(
      'inventory',
      inventory.map(i => i.id),
    );
    await cart.save();

    return cart;
  }
}
