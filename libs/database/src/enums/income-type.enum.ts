import { registerEnumType } from 'type-graphql';

export enum IncomeType {
  ACCESS = 'ACCESS',
  EARN = 'EARN',
  INVENTORY = 'INVENTORY',
  ADJUSTMENT = 'ADJUSTMENT',
}

registerEnumType(IncomeType, {
  name: 'IncomeType',
});
