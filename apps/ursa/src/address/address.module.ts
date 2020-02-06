import { Module } from '@nestjs/common';
import { AddressResolver } from './address.resolver';

@Module({
  providers: [AddressResolver],
})
export class AddressModule {}
