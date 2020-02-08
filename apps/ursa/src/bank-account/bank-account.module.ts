import { DatabaseModule } from '@app/database/database.module';
import { Module } from '@nestjs/common';

import { DwollaService } from '../dwolla.service';
import { PlaidService } from '../plaid.service';
import { BankAccountResolver } from './bank-account.resolver';
import { BankAccountService } from './bank-account.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    BankAccountResolver,
    BankAccountService,
    PlaidService,
    DwollaService,
  ],
})
export class BankAccountModule {}
