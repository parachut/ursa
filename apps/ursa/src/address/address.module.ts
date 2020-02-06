import { Module } from '@nestjs/common';
import { AddressResolver } from './address.resolver';
import { AddressService } from './address.service';

@Module({
  providers: [AddressResolver],
})
export class AddressModule {}
