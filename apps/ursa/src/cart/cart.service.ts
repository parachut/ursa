import { Cart, Inventory, User } from '@app/database/entities';
import { InventoryStatus, UserStatus } from '@app/database/enums';
import { Inject, Injectable } from '@nestjs/common';
import { Op } from 'sequelize';

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
    const cart = await Cart.findOne({
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
          model: Inventory,
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
          order: [['createdAt', 'DESC']],
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
        'subscriptions',
      ],
    });

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

    const recurlyId = user.integrations.find(int => int.type === 'RECURLY');

    const subscriptionReq: any = {
      planCode: cart.planId,
      addOns: [],
    };

    if (cart.protectionPlan) {
      subscriptionReq.addOns.push({
        code: 'protection',
        quantity: 1,
      });
    }

    if (user.additionalItems) {
      subscriptionReq.addOns.push({
        code: 'additional',
        quantity: user.additionalItems,
      });
    }

    if (!subscriptionReq.addOns.length) {
      delete subscriptionReq.addOns;
    }

    let _continue = false;

    try {
      if (!user.subscription?.length) {
        const purchaseReq = {
          currency: 'USD',
          account: {
            id: recurlyId.value,
          },
          subscriptions: [subscriptionReq],
          couponCodes: [],
          lineItems: [],
        };

        if (cart.couponCode) {
          purchaseReq.couponCodes.push(cart.couponCode);
        }

        if (!purchaseReq.couponCodes.length) {
          delete purchaseReq.couponCodes;
        }

        if (cart.service !== 'Ground') {
          purchaseReq.lineItems = [
            {
              type: 'charge',
              currency: 'USD',
              unitAmount: 50,
              quantity: 1,
              description: 'Expedited Shipping',
            },
          ];
        } else {
          delete purchaseReq.lineItems;
        }

        const purchase = await recurly.createPurchase(purchaseReq);
      } else {
        if (cart.service !== 'Ground') {
          await recurly.createPurchase({
            currency: 'USD',
            account: {
              id: recurlyId.value,
            },
            lineItems: [
              {
                type: 'charge',
                currency: 'USD',
                quantity: 1,
                unitAmount: 50,
                description: 'Expedited Shipping',
              },
            ],
          });
        }

        if (!user.legacyPlan) {
          try {
            subscriptionRes = await recurly.createSubscriptionChange(
              recurlySubscription.value,
              subscriptionReq,
            );
            _continue = true;
          } catch (e) {
            if (
              e.message ===
              'The submitted values match the current subscriptions values.'
            ) {
              _continue = true;
            } else {
              throw e;
            }
          }
        } else {
          _continue = true;
        }
      }
    } catch (e) {
      if (process.env.STAGE === 'production') {
        await slack.chat.postMessage({
          channel: 'CGX5HELCT',
          text: '',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text:
                  '*Order billing failed:* ' +
                  user.name +
                  '\n<https://app.forestadmin.com/48314/data/2108279/index/record/2108279/' +
                  cart.id +
                  '/summary|' +
                  cart.id +
                  '>',
              },
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: '*Completed:*\n' + new Date().toLocaleString(),
                },
                {
                  type: 'mrkdwn',
                  text:
                    '*Protection Plan:*\n' +
                    (cart.protectionPlan ? 'YES' : 'NO'),
                },
                {
                  type: 'mrkdwn',
                  text: '*Service:*\n' + cart.service,
                },
                {
                  type: 'mrkdwn',
                  text: '*Plan:*\n' + cart.planId || user.planId,
                },
                {
                  type: 'mrkdwn',
                  text: '*Reason:*\n' + e.message,
                },
              ],
            },
          ],
        });
      }

      throw new Error(e.message);
    }

    await Inventory.update(
      {
        status: 'SHIPMENTPREP',
        memberId: user.id,
      },
      {
        where: {
          id: {
            [Op.in]: inventory,
          },
        },
        individualHooks: true,
      },
    );

    if (process.env.STAGE === 'production') {
      try {
        await pMap(['CGX5HELCT', 'CA8M5UG1K'], c =>
          slack.chat.postMessage({
            channel: c,
            text: '',
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text:
                    '*New order for:* ' +
                    user.name +
                    '\n<https://app.forestadmin.com/48314/data/2108279/index/record/2108279/' +
                    cart.id +
                    '/summary|' +
                    cart.id +
                    '>',
                },
              },
              {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: '*Completed:*\n' + new Date().toLocaleString(),
                  },
                  {
                    type: 'mrkdwn',
                    text:
                      '*Protection Plan:*\n' +
                      (cart.protectionPlan ? 'YES' : 'NO'),
                  },
                  {
                    type: 'mrkdwn',
                    text: '*Service:*\n' + cart.service,
                  },
                  {
                    type: 'mrkdwn',
                    text: '*Plan:*\n' + cart.planId || user.planId,
                  },
                ],
              },
            ],
          }),
        );
      } catch (e) {}
    }

    if (_continue) {
      cart.confirmedAt = new Date();

      const shipment = await Shipment.create({
        direction: ShipmentDirection.OUTBOUND,
        expedited: cart.service !== 'Ground',
        type: ShipmentType.ACCESS,
        service: cart.service,
        cartId: cart.id,
      });

      await shipment.$set('inventory', inventory);
    }

    await sendEmail({
      to: user.email,
      from: 'support@parachut.co',
      id: !completedCart ? 12931487 : 12932745,
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
    await cart.$set('inventory', inventory);
    await cart.save();

    return cart;
  }
}
