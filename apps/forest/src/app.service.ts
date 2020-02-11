import { User } from '@app/database/entities';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly userRepository: typeof User = this.sequelize.getRepository(
    'User',
  );

  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  findUser(id: string) {
    return this.userRepository.findByPk(id);
  }
}
