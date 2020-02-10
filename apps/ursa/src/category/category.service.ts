import { Category } from '@app/database/entities';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  private readonly categoryRepository: typeof Category = this.sequelize.getRepository(
    'Category',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(id);
    }

    return category;
  }

  async find(): Promise<Category[]> {
    return this.categoryRepository.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  async breadCrumbs(id: string): Promise<Category[]> {
    const categories = await this.categoryRepository.findAll({});

    function findBreadCrumbs(id: string): Category[] {
      const cat = categories.find(cat => cat.id === id);
      const _categories = [cat];

      const getParent = async (child: Category) => {
        if (child.parentId) {
          const parent = categories.find(cate => cate.id === child.parentId);

          if (parent) {
            _categories.push(parent);

            if (parent.parentId) {
              getParent(parent);
            }
          }
        }
      };

      getParent(cat);
      return _categories;
    }

    return findBreadCrumbs(id);
  }
}
