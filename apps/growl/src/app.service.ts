import { UserToken } from '@app/database/entities';
import { Injectable, Inject } from '@nestjs/common';
import short from 'short-uuid';
import Sequelize, { Op } from 'sequelize';

@Injectable()
export class AppService {
  private readonly userTokenRepository: typeof UserToken = this.sequelize.getRepository(
    'UserToken',
  );
  private readonly translator = short();

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  async findToken(token: string): Promise<UserToken> {
    const userToken = await this.userTokenRepository.findOne({
      where: {
        token: this.translator.toUUID(token),
        spent: false,
        createdAt: { [Op.gte]: Sequelize.literal("NOW() - INTERVAL '1 hour'") },
      },
    });

    if (!userToken) {
      throw new Error('Unable to locate token.');
    }

    userToken.spent = true;

    return userToken.save();
  }
}
