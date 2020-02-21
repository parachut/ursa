import { registerEnumType } from 'type-graphql';

export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  SUPPORT = 'SUPPORT',
  LOGISTICS = 'LOGISTICS',
  GUEST = 'GUEST',
  AFFILIATE = 'AFFILIATE',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});
