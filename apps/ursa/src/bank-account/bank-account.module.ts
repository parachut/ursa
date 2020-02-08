import { DatabaseModule } from '@app/database/database.module';
import { Module } from '@nestjs/common';
import { BankAccountService } from './bank-account.service';
import { BankAccountResolver } from './bank-account.resolver';
import { PlaidService } from '../plaid.service';
import { DwollaService } from '../dwolla.service';

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
