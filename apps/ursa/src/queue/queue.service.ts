import { Queue } from '@app/database/entities';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  private readonly queueRepository: typeof Queue = this.sequelize.getRepository(
    'Queue',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  async findOne(id: string, userId: string) {
    const queue = await this.queueRepository.findOne({
      where: { id, userId },
    });

    if (!queue) {
      throw new NotFoundException(id);
    }

    return queue;
  }

  async find(userId: string) {
    return this.queueRepository.findAll({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  async create(productId: string, userId: string) {
    return this.queueRepository.create({
      productId,
      userId,
    });
  }

  async destroy(id: string, userId: string) {
    const queue = await this.queueRepository.findOne({
      where: {
        id,
        userId,
      },
    });

    await this.queueRepository.destroy({
      where: {
        id,
        userId,
      },
    });

    return queue;
  }
}
