import { registerEnumType } from 'type-graphql';

export enum AffiliateLinkType {
  ACCESS = 'ACCESS',
  EARN = 'EARN',
}

registerEnumType(AffiliateLinkType, {
  name: 'AffiliateLinkType',
});
