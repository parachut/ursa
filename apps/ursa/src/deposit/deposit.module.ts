import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { DepositService } from './deposit.service';
import { DepositResolver } from './deposit.resolver';
import { DwollaService } from '../dwolla.service';

@Module({
  imports: [DatabaseModule],
  providers: [DepositService, DepositResolver, DwollaService],
})
export class DepositModule {}
