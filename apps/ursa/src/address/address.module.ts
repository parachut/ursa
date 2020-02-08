import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';

import { AddressResolver } from './address.resolver';
import { AddressService } from './address.service';

@Module({
  imports: [DatabaseModule],
  providers: [AddressResolver, AddressService],
})
export class AddressModule {}
