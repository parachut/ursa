import { ShipKit, User } from '@app/database/entities';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

@Injectable()
export class ShipKitService {
  private readonly logger = new Logger(ShipKitService.name);

  private readonly shipKitRepository: typeof ShipKit = this.sequelize.getRepository(
    'ShipKit',
  );

  private readonly userRepository: typeof User = this.sequelize.getRepository(
    'User',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  async findOne(userId: string) {
    const shipKit = await this.shipKitRepository.findOne({
      where: {
        userId,
        completedAt: null,
      },
      include: [
        {
          association: 'inventory',
          include: ['product'],
        },
      ],
    });

    if (!shipKit) {
      const user = await this.userRepository.findByPk(userId, {
        include: ['addresses'],
      });

      const address = user.addresses.length
        ? user.addresses.find(address => address.primary) || user.addresses[0]
        : null;

      return this.shipKitRepository.create({
        addressId: address ? address.id : null,
        userId,
      });
    }

    if (!shipKit.address) {
      const user = await this.userRepository.findByPk(userId, {
        include: ['addresses'],
      });

      if (user.addresses.length) {
        const address = user.addresses.length
          ? user.addresses.find(address => address.primary) || user.addresses[0]
          : null;

        shipKit.addressId = address.id;
      }

      return shipKit.save();
    }

    return shipKit;
  }

  async find(userId: string) {
    return this.shipKitRepository.findAll({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  async update(input: Partial<ShipKit>, userId: string) {
    const shipKit = await this.shipKitRepository.findOne({
      where: { userId, completedAt: null },
    });

    if (!shipKit) {
      throw new NotFoundException(userId);
    }

    Object.assign(shipKit, input);

    return shipKit.save();
  }

  async complete(userId: string) {
    const shipKit = await this.shipKitRepository.findOne({
      where: { userId, completedAt: null },
    });

    if (!shipKit) {
      throw new NotFoundException(userId);
    }

    shipKit.completedAt = new Date();

    return shipKit.save();
  }
}
