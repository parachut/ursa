import { Address, User, UserVerification } from '@app/database/entities';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Client } from 'clearbit';
import { Op } from 'sequelize';

@Injectable()
export class AddressService {
  private readonly addressRepository: typeof Address = this.sequelize.getRepository(
    'Address',
  );
  private readonly userRepository: typeof User = this.sequelize.getRepository(
    'User',
  );

  private readonly userVerificationRepository: typeof UserVerification = this.sequelize.getRepository(
    'UserVerification',
  );

  private readonly clearbitClient = new Client({ key: process.env.CLEARBIT });

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  async checkClearbitFraud(
    userId: string,
    zip: string,
    country = 'US',
    ipAddress = '0.0.0.0',
  ): Promise<UserVerification> {
    const user = await this.userRepository.findByPk(userId);

    const result = await this.clearbitClient.Risk.calculate({
      country_code: country,
      email: user.email,
      ip: ipAddress,
      name: user.name,
      zip_code: zip,
    });

    return this.userVerificationRepository.create({
      type: 'CLEARBIT_FRAUD',
      verified: result.risk.level !== 'high',
      meta: JSON.stringify(result),
      userId,
    });
  }

  async createAddress(input: Partial<Address>, ip: string) {
    await this.checkClearbitFraud(input.userId, input.zip, input.country, ip);

    return this.addressRepository.create(input);
  }

  async deleteAddress(addressId: string, userId: string) {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException(addressId);
    }

    await address.destroy();

    return address;
  }

  async findOne(addressId: string, userId: string) {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException(addressId);
    }

    return address;
  }

  async findPrimary(userId: string) {
    const address = await this.addressRepository.findOne({
      where: { primary: true, userId },
      order: [['createdAt', 'DESC']],
    });

    return address;
  }

  async find(userId: string) {
    return this.addressRepository.findAll({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  async setPrimary(addressId: string, userId: string) {
    return Promise.all([
      this.addressRepository.update(
        {
          primary: false,
        },
        {
          where: {
            userId,
            id: { [Op.ne]: addressId },
          },
        },
      ),
      this.addressRepository.update(
        {
          primary: true,
        },
        {
          where: {
            userId,
            id: addressId,
          },
        },
      ),
    ]);
  }
}
