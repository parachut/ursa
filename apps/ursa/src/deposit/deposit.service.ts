import { Deposit, User } from '@app/database/entities';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { DwollaService } from '../dwolla.service';

@Injectable()
export class DepositService {
  private readonly logger = new Logger(DepositService.name);

  private readonly depositRepository: typeof Deposit = this.sequelize.getRepository(
    'Deposit',
  );

  private readonly userRepository: typeof User = this.sequelize.getRepository(
    'User',
  );

  constructor(
    @Inject('SEQUELIZE') private readonly sequelize,
    private readonly dwollaService: DwollaService,
  ) {}

  async findOne(id: string, userId: string) {
    const deposit = await this.depositRepository.findOne({
      where: { id, userId },
    });

    if (!deposit) {
      throw new NotFoundException(id);
    }

    return deposit;
  }

  async find(userId: string) {
    return this.depositRepository.findAll({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  async create(amount: number, userId: string): Promise<Deposit> {
    const user = await this.userRepository.findByPk(userId, {
      include: ['bankAccounts', 'funds'],
    });

    if (user.funds.balance < amount) {
      throw new Error('You are attempting to transfer more than is available.');
    }

    const bankAccount = user.bankAccounts.find(account => account.primary);

    const deposit = await Deposit.create({
      amount,
      userId,
      userBankAccountId: bankAccount.id,
    });

    const dwollaRef = await this.dwollaService.createDeposit(
      bankAccount.plaidUrl,
      amount,
      deposit.get('id'),
      userId,
    );

    deposit.plaidUrl = dwollaRef;
    return deposit.save();
  }
}
