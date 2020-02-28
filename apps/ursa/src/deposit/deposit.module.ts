import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { DwollaService } from '../dwolla.service';
import { DepositResolver } from './deposit.resolver';
import { DepositService } from './deposit.service';

@Module({
  imports: [],
  providers: [DepositService, DepositResolver, DwollaService],
})
export class DepositModule {}
