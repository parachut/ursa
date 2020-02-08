import { Deposit } from '@app/database/entities';
import { Resolver } from '@nestjs/graphql';

@Resolver(of => Deposit)
export class DepositResolver {}
