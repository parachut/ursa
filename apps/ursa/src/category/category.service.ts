import { Category } from '@app/database/entities';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  private readonly categoryRepository: typeof Category = this.sequelize.getRepository(
    'Category',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(id);
    }

    return category;
  }

  async find() {
    return this.categoryRepository.findAll({
      order: [['createdAt', 'DESC']],
    });
  }
}
